import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useLanguage } from '../../lib/language';
import { getCategories, getItems } from '../../lib/api/menu';
import { supabase } from '../../lib/supabase';

type EventRow = {
  event_type: 'item_view' | 'add_to_bill' | 'category_click' | 'search_used' | 'session_start';
  item_id: string | null;
  category_id: string | null;
  session_id: string;
  created_at: string;
};

type RankedItem = {
  id: string;
  name: string;
  views: number;
  adds: number;
};

type RankedItemWithConversion = RankedItem & {
  conversion: number;
};

type RankedCategory = {
  id: string;
  name: string;
  clicks: number;
};

type HourBucket = {
  hour: number;
  count: number;
};

const DEFAULT_DAYS = 7;

export default function Analytics() {
  const { language, t } = useLanguage();
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadTick, setReloadTick] = useState(0);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [itemNames, setItemNames] = useState<Record<string, string>>({});
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');

        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

        const [{ data: eventData, error: eventsError }, items, categories] = await Promise.all([
          supabase
            .from('events')
            .select('event_type,item_id,category_id,session_id,created_at')
            .gte('created_at', since)
            .order('created_at', { ascending: false })
            .limit(10_000),
          getItems(),
          getCategories()
        ]);

        if (eventsError) throw eventsError;

        const nextItemNames: Record<string, string> = {};
        for (const item of items) {
          if (!item.id) continue;
          nextItemNames[item.id] = language === 'ar' ? item.name_ar : item.name_en;
        }

        const nextCategoryNames: Record<string, string> = {};
        for (const category of categories) {
          if (!category.id) continue;
          nextCategoryNames[category.id] = language === 'ar' ? category.name_ar : category.name_en;
        }

        setEvents((eventData ?? []) as EventRow[]);
        setItemNames(nextItemNames);
        setCategoryNames(nextCategoryNames);
      } catch {
        setError(t('تعذر تحميل بيانات التحليلات.', 'Unable to load analytics data.'));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [days, language, reloadTick, t]);

  const stats = useMemo(() => {
    const viewCounts = new Map<string, number>();
    const addCounts = new Map<string, number>();
    const categoryClicks = new Map<string, number>();
    const sessions = new Set<string>();

    let totalAdds = 0;
    let totalViews = 0;

    for (const event of events) {
      if (event.session_id) {
        sessions.add(event.session_id);
      }

      if (event.event_type === 'item_view' && event.item_id) {
        totalViews += 1;
        viewCounts.set(event.item_id, (viewCounts.get(event.item_id) ?? 0) + 1);
      }

      if (event.event_type === 'add_to_bill' && event.item_id) {
        totalAdds += 1;
        addCounts.set(event.item_id, (addCounts.get(event.item_id) ?? 0) + 1);
      }

      if (event.event_type === 'category_click' && event.category_id) {
        categoryClicks.set(event.category_id, (categoryClicks.get(event.category_id) ?? 0) + 1);
      }
    }

    const rankedItems: RankedItem[] = [];
    const allItemIds = new Set([...viewCounts.keys(), ...addCounts.keys()]);

    for (const id of allItemIds) {
      rankedItems.push({
        id,
        name: itemNames[id] ?? t('صنف غير معروف', 'Unknown item'),
        views: viewCounts.get(id) ?? 0,
        adds: addCounts.get(id) ?? 0
      });
    }

    const rankedCategories: RankedCategory[] = [];
    for (const [id, clicks] of categoryClicks.entries()) {
      rankedCategories.push({
        id,
        clicks,
        name: categoryNames[id] ?? t('قسم غير معروف', 'Unknown category')
      });
    }

    const topViewed = [...rankedItems].sort((a, b) => b.views - a.views).slice(0, 5);
    const topAdded = [...rankedItems].sort((a, b) => b.adds - a.adds).slice(0, 5);
    const topCategories = rankedCategories.sort((a, b) => b.clicks - a.clicks).slice(0, 5);

    const itemsWithConversion: RankedItemWithConversion[] = rankedItems.map((item) => ({
      ...item,
      conversion: item.views > 0 ? item.adds / item.views : 0
    }));

    const topConverting = [...itemsWithConversion]
      .filter((item) => item.views >= 3)
      .sort((a, b) => (b.conversion === a.conversion ? b.adds - a.adds : b.conversion - a.conversion))
      .slice(0, 5);

    const insights = itemsWithConversion
      .filter((item) => item.views >= 5)
      .filter((item) => item.conversion <= 0.25)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const eventsByHour = new Map<number, number>();
    for (let hour = 0; hour < 24; hour += 1) {
      eventsByHour.set(hour, 0);
    }

    for (const event of events) {
      const parsedDate = new Date(event.created_at);
      const hour = parsedDate.getHours();
      eventsByHour.set(hour, (eventsByHour.get(hour) ?? 0) + 1);
    }

    const hourlyActivity: HourBucket[] = Array.from(eventsByHour.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour);

    const peakHours = [...hourlyActivity].sort((a, b) => b.count - a.count).slice(0, 3);

    return {
      sessions: sessions.size,
      totalAdds,
      totalViews,
      topViewed,
      topAdded,
      topConverting,
      topCategories,
      insights,
      hourlyActivity,
      peakHours
    };
  }, [categoryNames, events, itemNames, t]);

  function formatPercent(value: number) {
    return `${(value * 100).toFixed(0)}%`;
  }

  function formatHourLabel(hour: number) {
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const end = `${((hour + 1) % 24).toString().padStart(2, '0')}:00`;
    return `${start} - ${end}`;
  }

  const maxHourlyCount = Math.max(1, ...stats.hourlyActivity.map((bucket) => bucket.count));

  return (
    <section className="space-y-4">
      <Card className="space-y-3 rounded-3xl bg-surface/95 p-4 shadow-elevate">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{t('التحليلات', 'Analytics')}</p>
            <h2 className="text-xl font-semibold">{t('نظرة عامة', 'Overview')}</h2>
          </div>
          <div className="flex items-center gap-2">
            {[1, 7, 30].map((value) => (
              <Button key={value} className="min-h-9 px-3 text-sm" variant={days === value ? 'primary' : 'secondary'} onClick={() => setDays(value)}>
                {t(`${value} يوم`, `${value}d`)}
              </Button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="secondary" onClick={() => setReloadTick((value) => value + 1)}>
              {t('إعادة المحاولة', 'Retry')}
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="rounded-3xl bg-surface/95 p-4 shadow-elevate">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{t('إجمالي الجلسات', 'Total sessions')}</p>
          <p className="mt-2 text-2xl font-semibold">{loading ? '—' : stats.sessions}</p>
        </Card>
        <Card className="rounded-3xl bg-surface/95 p-4 shadow-elevate">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{t('إجمالي الإضافات', 'Total adds')}</p>
          <p className="mt-2 text-2xl font-semibold">{loading ? '—' : stats.totalAdds}</p>
        </Card>
        <Card className="rounded-3xl bg-surface/95 p-4 shadow-elevate">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">{t('إجمالي المشاهدات', 'Total item views')}</p>
          <p className="mt-2 text-2xl font-semibold">{loading ? '—' : stats.totalViews}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl bg-surface/95 p-4 shadow-elevate">
          <h3 className="mb-3 text-lg font-semibold">{t('أكثر الأصناف مشاهدة', 'Top items by views')}</h3>
          <ul className="space-y-2">
            {(loading ? [] : stats.topViewed).map((item) => (
              <li key={`view-${item.id}`} className="flex items-center justify-between rounded-2xl border border-border/50 px-3 py-2 text-sm">
                <span className="truncate pe-3">{item.name}</span>
                <span className="font-medium tabular-nums">{item.views}</span>
              </li>
            ))}
            {!loading && stats.topViewed.length === 0 ? <li className="text-sm text-muted">{t('لا توجد بيانات كافية بعد.', 'Not enough data yet.')}</li> : null}
          </ul>
        </Card>

        <Card className="rounded-3xl bg-surface/95 p-4 shadow-elevate">
          <h3 className="mb-3 text-lg font-semibold">{t('أكثر الأصناف إضافة للحساب', 'Top items by adds')}</h3>
          <ul className="space-y-2">
            {(loading ? [] : stats.topAdded).map((item) => (
              <li key={`add-${item.id}`} className="flex items-center justify-between rounded-2xl border border-border/50 px-3 py-2 text-sm">
                <span className="truncate pe-3">{item.name}</span>
                <span className="font-medium tabular-nums">{item.adds}</span>
              </li>
            ))}
            {!loading && stats.topAdded.length === 0 ? <li className="text-sm text-muted">{t('لا توجد بيانات كافية بعد.', 'Not enough data yet.')}</li> : null}
          </ul>
        </Card>
      </div>

      <Card className="rounded-3xl bg-surface/95 p-4 shadow-elevate">
        <h3 className="mb-3 text-lg font-semibold">{t('الأصناف الأعلى تحويلاً', 'Top converting items')}</h3>
        <ul className="space-y-2">
          {(loading ? [] : stats.topConverting).map((item) => (
            <li key={`conversion-${item.id}`} className="rounded-2xl border border-border/50 px-3 py-2 text-sm">
              <p className="truncate font-medium">{item.name}</p>
              <p className="mt-1 text-xs text-muted">
                {t('تحويل', 'Conversion')}: <span className="tabular-nums">{formatPercent(item.conversion)}</span> · {t('إضافات', 'Adds')}:{' '}
                <span className="tabular-nums">{item.adds}</span> / {t('مشاهدات', 'Views')}: <span className="tabular-nums">{item.views}</span>
              </p>
            </li>
          ))}
          {!loading && stats.topConverting.length === 0 ? <li className="text-sm text-muted">{t('لا توجد بيانات كافية بعد.', 'Not enough data yet.')}</li> : null}
        </ul>
      </Card>

      <Card className="rounded-3xl bg-surface/95 p-4 shadow-elevate">
        <h3 className="mb-3 text-lg font-semibold">{t('الأقسام الأكثر نقراً', 'Top categories')}</h3>
        <ul className="space-y-2">
          {(loading ? [] : stats.topCategories).map((category) => (
            <li key={category.id} className="flex items-center justify-between rounded-2xl border border-border/50 px-3 py-2 text-sm">
              <span className="truncate pe-3">{category.name}</span>
              <span className="font-medium tabular-nums">{category.clicks}</span>
            </li>
          ))}
          {!loading && stats.topCategories.length === 0 ? <li className="text-sm text-muted">{t('لا توجد بيانات كافية بعد.', 'Not enough data yet.')}</li> : null}
        </ul>
      </Card>

      <Card className="rounded-3xl bg-surface/95 p-4 shadow-elevate">
        <h3 className="mb-3 text-lg font-semibold">{t('فرص التحسين', 'Insight: high views, low adds')}</h3>
        <ul className="space-y-2">
          {(loading ? [] : stats.insights).map((item) => (
            <li key={`insight-${item.id}`} className="rounded-2xl border border-border/50 px-3 py-2 text-sm">
              <p className="truncate font-medium">{item.name}</p>
              <p className="mt-1 text-xs text-muted">
                {t('مشاهدات', 'Views')}: <span className="tabular-nums">{item.views}</span> · {t('إضافات', 'Adds')}: <span className="tabular-nums">{item.adds}</span> · {t('التحويل', 'Conversion')}:{' '}
                <span className="tabular-nums">{formatPercent(item.conversion)}</span>
              </p>
            </li>
          ))}
          {!loading && stats.insights.length === 0 ? <li className="text-sm text-muted">{t('لا توجد فرص واضحة حالياً.', 'No clear insight candidates right now.')}</li> : null}
        </ul>
      </Card>

      <Card className="rounded-3xl bg-surface/95 p-4 shadow-elevate">
        <h3 className="mb-3 text-lg font-semibold">{t('النشاط حسب الساعة', 'Activity by hour')}</h3>
        <ul className="space-y-2">
          {(loading ? [] : stats.hourlyActivity).map((bucket) => (
            <li key={`hour-${bucket.hour}`} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{formatHourLabel(bucket.hour)}</span>
                <span className="tabular-nums">{bucket.count}</span>
              </div>
              <div className="h-2 rounded-full bg-surface2">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max((bucket.count / maxHourlyCount) * 100, bucket.count > 0 ? 6 : 0)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-2xl border border-border/50 bg-surface px-3 py-2">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">{t('ساعات الذروة', 'Peak activity hours')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(loading ? [] : stats.peakHours).map((bucket) => (
              <span key={`peak-${bucket.hour}`} className="rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium">
                {formatHourLabel(bucket.hour)} · <span className="tabular-nums">{bucket.count}</span>
              </span>
            ))}
            {!loading && stats.peakHours.length === 0 ? <span className="text-sm text-muted">{t('لا توجد بيانات كافية بعد.', 'Not enough data yet.')}</span> : null}
          </div>
        </div>
      </Card>
    </section>
  );
}
