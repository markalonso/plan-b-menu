import { createClient } from '@supabase/supabase-js';

type SeedItem = {
  name_en: string;
  name_ar: string;
  price: number | string;
  desc_en: string;
  desc_ar: string;
};

type SeedCategory = {
  slug: string;
  name_en: string;
  name_ar: string;
  items: SeedItem[];
};

const MAIN_DISHES_NOTE_AR = 'جميع االطباق تقدم مع2 او سايد من اختيارك 1 باستا ( خضار سوتيه- بطاطس مهروسة-  بطاطس مقلية- أرز) ( باستا ريد صوص- باستا وايت صوص)';
const MAIN_DISHES_NOTE_EN = 'All main dishes are served with 2 side dishes of your choice or 1 pasta. (Rice - Fries - Mashed Potato - Sautéed Vegetables) (Pasta White Sauce - Pasta Red Sauce)';

const MENU: SeedCategory[] = [
  { slug: 'salad', name_en: 'Salad', name_ar: 'سلطة', items: [
    { name_en: 'Greek Salad', name_ar: 'جريك سالط', price: 100, desc_ar: '', desc_en: '' },
    { name_en: 'Tuna Salad', name_ar: 'تونة سالط', price: 150, desc_ar: '', desc_en: '' },
    { name_en: 'Chicken Cesar', name_ar: 'تشكن سيزار', price: 160, desc_ar: '', desc_en: '' },
    { name_en: 'Oriental Salad', name_ar: 'سلطة بلدي', price: 50, desc_ar: '', desc_en: '' },
    { name_en: 'Cesar Classic', name_ar: 'سيزار كالسيك', price: 100, desc_ar: '', desc_en: '' },
    { name_en: 'Caprese Salad', name_ar: 'كابريزي سالط', price: 110, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'appetizers', name_en: 'Appetizers', name_ar: 'المقبالت', items: [
    { name_en: 'Chicken Fingers', name_ar: 'اصابع فراخ', price: 110, desc_ar: '', desc_en: '' },
    { name_en: 'Bruschetta', name_ar: 'بروسكاتا', price: 70, desc_ar: '', desc_en: '' },
    { name_en: 'Mozzarella Sticks', name_ar: 'أصابع موتزرال', price: 100, desc_ar: '', desc_en: '' },
    { name_en: 'Onions Rings', name_ar: 'حلقات البصل', price: 80, desc_ar: '', desc_en: '' },
    { name_en: 'Fish Fingers', name_ar: 'اصابع السمك', price: 110, desc_ar: '', desc_en: '' },
    { name_en: 'Cheese Samosa', name_ar: 'سمبوسك جبنة', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Meat Samosa', name_ar: 'سمبوسك لحمة', price: 110, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'sandwiches', name_en: 'Sandwiches', name_ar: 'ساندوتش', items: [
    { name_en: 'Chicken Shawarma', name_ar: 'شاورما فراخ', price: 140, desc_ar: '', desc_en: '' },
    { name_en: 'Alexander Liver', name_ar: 'كبدة اسكندراني', price: 120, desc_ar: '', desc_en: '' },
    { name_en: 'Kofta', name_ar: 'كفتة', price: 130, desc_ar: '', desc_en: '' },
    { name_en: 'Beef Shawarma', name_ar: 'شاورما لحمة', price: 160, desc_ar: '', desc_en: '' },
    { name_en: 'Chicken Pane', name_ar: 'فراخ بانيه', price: 150, desc_ar: '', desc_en: '' },
    { name_en: 'Mexican Hor Dog', name_ar: 'هود دوج مكسيكان', price: 130, desc_ar: '', desc_en: '' },
    { name_en: 'Hawawshi', name_ar: 'حواوشي', price: 130, desc_ar: '', desc_en: '' },
    { name_en: 'BBQ Chicken', name_ar: 'فراخ باربكيو', price: 140, desc_ar: '', desc_en: '' },
    { name_en: 'Plan B Toast', name_ar: 'بالن بي توست', price: 150, desc_ar: '(سموكد بيف-  تركي-  سالمي)', desc_en: '(Smoked Beef - Turkey - Salami)' },
    { name_en: 'Mix Cheese', name_ar: 'مكس جبن', price: 120, desc_ar: '', desc_en: '' },
    { name_en: 'Club Sandwich', name_ar: 'كلوب ساندوتش', price: 140, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'chicken-crispy', name_en: 'Chicken Crispy', name_ar: 'فراخ كرسبي', items: [
    { name_en: 'Turkey Crispy', name_ar: 'تركي كرسبي', price: 165, desc_ar: '(سموك تركي-  فراخ- خس-  خيار مخلل- )صوص جبنة', desc_en: '(Smoked Turkey - Chicken - Lettuce - Pickles - Cheese Sauce)' },
    { name_en: 'Crispy Classic', name_ar: 'كالسيك كرسبي', price: 150, desc_ar: '', desc_en: '' },
    { name_en: 'Crispy Jalapeno', name_ar: 'هالبينو كرسبي', price: 165, desc_ar: '(فلفل هالبينو-  فراخ- خس-  خيار مخلل- )صوص جبنة', desc_en: '(Spicy Jalapeno - Chicken - Lettuce - Pickles - Cheese Sauce)' },
    { name_en: 'Plan B Crispy', name_ar: 'بالن بي كرسبي', price: 180, desc_ar: '(سموكد بيف-  فراخ- خس-  خيار مخلل- ) صوص تكساس- صوص جبنة', desc_en: '(Smoked Beef - Chicken - Lettuce - Pickles - Cheese Sauce - Texas Sauce)' },
    { name_en: 'Blue Cheese', name_ar: 'بلو تشيز', price: 180, desc_ar: '(جبنة ريكفورد-  فراخ- خس-  خيار مخلل- )صوص جبنة', desc_en: '(Roquefort Cheese - Chicken - Lettuce - Pickles - Cheese Sauce)' }
  ]},
  { slug: 'burger', name_en: 'Burger', name_ar: 'برجر', items: [
    { name_en: 'Classic', name_ar: 'كالسيك', price: 160, desc_ar: '(برجر-  خس-  طماطم-  خيار مخلل-  مايونيز- ) بصل-', desc_en: '(Burger - Lettuce - Tomato - Pickles - Mayonnaise - Onions)' },
    { name_en: 'Jalapeno', name_ar: 'هالبينو', price: 170, desc_ar: '(برجر-  فلفل هالبينو-خس-  خيار مخلل- ) بصل-  صوص جبنة- طماطم', desc_en: '(Burger - Spicy Jalapeno - Tomato - Lettuce - Pickles - Cheese Sauce - Onions)' },
    { name_en: 'Hammer', name_ar: 'هامر', price: 175, desc_ar: '(برجر- سموك بيف- خس-  خيار مخلل- -  صوص باربكيو-  صوص شيدر- طماطم )بصل', desc_en: '(Burger - Smoked Beef - Tomato - Lettuce - Pickles - Cheddar Sauce - Barbecue Sauce - Onions)' },
    { name_en: 'Mozzarella', name_ar: 'موتزريال', price: 175, desc_ar: '(برجر- خس- طماطم-  خيار مخلل- )بصل-  صوص شيدر- موتزريال', desc_en: '(Burger - Tomato - Lettuce - Pickles - Cheddar Sauce - Mozzarella - Onions)' },
    { name_en: 'Plan B', name_ar: 'بالن بي', price: 180, desc_ar: '(برجر-  مشروم-  حلقات بصل- خس- خيار مخلل- )بصل-  صوص شيدر- طماطم- مخلل', desc_en: '(Burger - Onion Rings - Tomato - Lettuce - Pickles - Cheddar Sauce - Onions)' },
    { name_en: 'Blue Cheese', name_ar: 'بلو تشيز', price: 180, desc_ar: '(برجر- صوص بلو تشيز-خس-  خيار مخلل- )بصل- طماطم-', desc_en: '(Burger - Blue Cheese Sauce - Tomato - Lettuce - Pickles - Onions)' }
  ]},
  { slug: 'pizza', name_en: 'Pizza', name_ar: 'Pizza - بيتزا', items: [
    { name_en: 'Crispy Chicken Ranch', name_ar: 'فراخ كرسبي رانش', price: 180, desc_ar: '', desc_en: '' },
    { name_en: 'Margherita', name_ar: 'مارجريتا', price: 130, desc_ar: '', desc_en: '' },
    { name_en: 'Vegetables', name_ar: 'خضروات', price: 140, desc_ar: '', desc_en: '' },
    { name_en: 'BBQ Chicken', name_ar: 'فراخ باربكيو', price: 180, desc_ar: '', desc_en: '' },
    { name_en: 'Tuna', name_ar: 'تونة', price: 190, desc_ar: '', desc_en: '' },
    { name_en: 'Seafood', name_ar: 'سي فود', price: 210, desc_ar: '', desc_en: '' },
    { name_en: 'Salami', name_ar: 'سالمي', price: 180, desc_ar: '', desc_en: '' },
    { name_en: 'Quattro Formaggi', name_ar: 'كواترو', price: 185, desc_ar: '', desc_en: '' },
    { name_en: 'Pastrami', name_ar: 'بسطرمة', price: 190, desc_ar: '', desc_en: '' },
    { name_en: 'Plan B', name_ar: 'بالن بي', price: 200, desc_ar: '(فراخ-  سالمي-  هوت دوج-  مشروم)', desc_en: '(Chicken - Salami - Hot dog - Mushroom)' }
  ]},
  { slug: 'breakfast', name_en: 'Breakfast', name_ar: 'فطار', items: [
    { name_en: 'Plan B Breakfast', name_ar: 'فطار بالن بي', price: 140, desc_ar: 'مشروم-  بطاطس-  اومليت- سوسيس', desc_en: 'Sausage - Omelette - Fries - Mushroom' },
    { name_en: 'Oriental', name_ar: 'اورينتال', price: 100, desc_ar: 'فول-  طعمية-  بطاطس-  ييض-  سلطة', desc_en: 'Ful - Falafel - Fries - Egg - Salad' },
    { name_en: 'Spanish Omelette', name_ar: 'سبانش اومليت', price: 85, desc_ar: 'يقدم مع جبنة بالطماطم', desc_en: 'Served with tomato & cheese' },
    { name_en: 'Mix Cheese', name_ar: 'مكس جبن', price: 120, desc_ar: 'جبنة رومي-  بيضا-  شيدر', desc_en: 'Romy - White - Cheddar' },
    { name_en: 'Pastrami Omelette', name_ar: 'بسطرمة اومليت', price: 100, desc_ar: 'يقدم مع جبنة بالطماطم', desc_en: 'Served with tomato & cheese' }
  ]},
  { slug: 'soup', name_en: 'Soup', name_ar: 'شوربة', items: [
    { name_en: 'Chicken Mushroom', name_ar: 'شوربة فراخ مشروم', price: 150, desc_ar: '', desc_en: '' },
    { name_en: 'Seafood Soup', name_ar: 'شوربة سي فود', price: 180, desc_ar: '', desc_en: '' },
    { name_en: 'Tomato Soup', name_ar: 'شوربة طماطم', price: 100, desc_ar: '', desc_en: '' },
    { name_en: 'Lentils Soup', name_ar: 'شوربة عدس', price: 100, desc_ar: '', desc_en: '' },
    { name_en: 'Vegetables Soup', name_ar: 'شوربة خضار', price: 85, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'pasta', name_en: 'Pasta', name_ar: 'ابستا', items: [
    { name_en: 'Arabiata', name_ar: 'أريبياتا', price: 120, desc_ar: '', desc_en: '' },
    { name_en: 'Chicken Pesto', name_ar: 'بيستو فراخ', price: 180, desc_ar: '', desc_en: '' },
    { name_en: 'Bolognese', name_ar: 'بولونيز', price: 150, desc_ar: '', desc_en: '' },
    { name_en: 'Alfredo', name_ar: 'الفريدو', price: 180, desc_ar: '', desc_en: '' },
    { name_en: 'Pesto', name_ar: 'بيستو', price: 130, desc_ar: '', desc_en: '' },
    { name_en: 'Negresco', name_ar: 'نجرسكو', price: 190, desc_ar: '', desc_en: '' },
    { name_en: 'Vegetables', name_ar: 'خضروات', price: 130, desc_ar: '', desc_en: '' },
    { name_en: 'Seafood', name_ar: 'سي فوود', price: 200, desc_ar: '', desc_en: '' },
    { name_en: 'Mix Cheese', name_ar: 'مكس جبن', price: 190, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'chicken', name_en: 'Chicken', name_ar: 'اطباق الفراخ / chicken', items: [
    { name_en: 'Grilled Chicken', name_ar: 'جريلد تشيكن', price: 240, desc_ar: '(صدور فراخ مشوي على الجريل)', desc_en: '(Grilled chicken breast)' },
    { name_en: 'Chicken Mushroom', name_ar: 'فراخ مشروم', price: 260, desc_ar: '( صوص مشروم- صدور فراخ)', desc_en: '(Chicken Breast - Mushroom Sauce)' },
    { name_en: 'Green Chicken', name_ar: 'فراخ جرين', price: 280, desc_ar: '( صوص سبانخ- صدر فراخ محشو سبانح و جبنة)', desc_en: '(Chicken Breast Stuffed with Spinach & Cheese)' },
    { name_en: 'Chicken Curry', name_ar: 'فراخ كاري', price: 260, desc_ar: '( قطع اناناس-  صوص كاري- صدور فراخ)', desc_en: '(Chicken breast - Curry sauce - pineapple)' },
    { name_en: 'Mexican Chicken', name_ar: 'فراخ مكسيكان', price: 265, desc_ar: 'فراخ-  صوص سويت شيلي-  فلفل الوان-  سويت كورن', desc_en: '(Chicken - sweet chilli sauce - colored pepper - sweet corn)' },
    { name_en: 'Chicken Lemon', name_ar: 'فراخ بصوص الليمون', price: 260, desc_ar: '( صوص ليمون و شبت- صدور فراخ)', desc_en: '(Chicken breast - lemon sauce - Dill)' },
    { name_en: 'Chicken Plan B', name_ar: 'فراخ بالن بي', price: 280, desc_ar: 'فراخ-  قطع هوت دوج-  زيتون-  فلفل الوان- جبنة موتزرال', desc_en: '(Chicken - hot dog - olive - Colored Pepper - Mozzarella)' },
    { name_en: 'Chicken Cordon Bleu', name_ar: 'كوردن بلو', price: 280, desc_ar: '(صدر فراخ محشو سالمي-  تركي-  جبنة)', desc_en: '(Stuffed chicken with salami, turkey & cheese)' }
  ]},
  { slug: 'beef', name_en: 'Beef', name_ar: 'لحوم / Beef', items: [
    { name_en: 'Beef Fillet', name_ar: 'بيف فيلية', price: 380, desc_ar: '', desc_en: '' },
    { name_en: 'Mushroom Piccata', name_ar: 'بيكاتا مشروم', price: 360, desc_ar: '( صوص مشروم- قطع لحم)', desc_en: '(Beef - Mushroom Sauce)' },
    { name_en: 'Beef Fajita', name_ar: 'بييف فاهيتا', price: 360, desc_ar: '(قطع لحم-  فلفل الوان-  بصل-  صويا صوص)', desc_en: '(Beef - Colored Pepper - Onion - Soya Sauce)' },
    { name_en: 'Plan B Beef', name_ar: 'بالن بي بيف', price: 400, desc_ar: '(قطع لحم-  سالمي-  نركي-  جبنة موتزرال)', desc_en: '(Beef - Salami - turkey - Mozzarella)' }
  ]},
  { slug: 'seafood', name_en: 'Seafood', name_ar: 'سي فود / Seafood', items: [
    { name_en: 'Fish Fillet', name_ar: 'فيلية سمك', price: 250, desc_ar: '', desc_en: '' },
    { name_en: 'Fish & Chips', name_ar: 'فيش & تشيبس', price: 250, desc_ar: '', desc_en: '' },
    { name_en: 'Mix Seafood', name_ar: 'ميكس سي فود', price: 350, desc_ar: '', desc_en: '' },
    { name_en: 'Shrimp Fajita', name_ar: 'فاهيتا جمبرى', price: 350, desc_ar: '(جمبري-  فلفل الوان-  بصل)', desc_en: '(Shrimps - Colored Pepper - Onion)' }
  ]},
  { slug: 'barbecue-bbq', name_en: 'Barbecue (BBQ)', name_ar: 'مشوايت / Barbecue (BBQ)', items: [
    { name_en: '(1/2) Chicken Tikka', name_ar: 'نص فراخ تكا عالفحم', price: 210, desc_ar: '', desc_en: '' },
    { name_en: 'Shish Tawook', name_ar: 'شيش طاووق عالفحم', price: 200, desc_ar: '', desc_en: '' },
    { name_en: 'Kofta', name_ar: 'كفتة عالفحم', price: 240, desc_ar: '', desc_en: '' },
    { name_en: 'Mix Plan B', name_ar: 'مكس بالن بي عالفحم', price: 300, desc_ar: '( شيش طاووق-  صدر فراخ- كفتة)', desc_en: '(2 Kofta - Chicken Breast - Shish tawook)' }
  ]},
  { slug: 'kids-meals', name_en: 'Kids Meals', name_ar: 'وجبات أطفال', items: [
    { name_en: 'Mini Burger & Fries', name_ar: 'ميني برحر مع بطاطس', price: 120, desc_ar: '', desc_en: '' },
    { name_en: 'Nuggets with Fries', name_ar: 'ناجتس مع بطاطس', price: 120, desc_ar: '', desc_en: '' },
    { name_en: 'Spaghetti tomato Sauce', name_ar: 'سباجيتي صوص طماطم', price: 100, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'cocktails', name_en: 'COCKTAILS', name_ar: 'كوكتيل', items: [
    { name_en: 'Blue Cocktail', name_ar: 'بلو كوكتيل', price: 95, desc_ar: '(جوافة، بلو بيرى)', desc_en: '(guava, blueberry)' },
    { name_en: 'Super Smart', name_ar: 'سوبر سمارت', price: 100, desc_ar: '(موز، كيوي، فانيليا أيس كريم)', desc_en: '(orange, peach, mango)' },
    { name_en: 'Magic', name_ar: 'ماجيك', price: 100, desc_ar: '(موز، كيوى، فراولة)', desc_en: '(banana, kiwi, strawberry)' },
    { name_en: 'Banana-Caramelato', name_ar: 'موز كرميالتو', price: 105, desc_ar: '(لبن-  بلح- موز، كراميل)', desc_en: '(banana, caramel, Dates, milk)' },
    { name_en: 'Florida', name_ar: 'فلوريدا', price: 95, desc_ar: '( فراولة-  جوافة- مانجو)', desc_en: '(mango -guava - strawberry)' },
    { name_en: 'Happy Nation', name_ar: 'هایی نیشن', price: 100, desc_ar: '( أناناس-  فانيليا أيس كريم-  مانجو- موز)', desc_en: '(banana, mango, vanilla icecream, pineapple)' },
    { name_en: 'Passion', name_ar: 'باشون', price: 100, desc_ar: '( فانيليا ايس كريم-  باشون-  موز- مانجو)', desc_en: '(mango - banana - passion - vanilla ice cream)' },
    { name_en: 'Enjoy', name_ar: 'انجوي', price: 105, desc_ar: '(موز، كيوي، فانيليا أيس كريم)', desc_en: '(banana, kiwi, vanilla ice cream)' },
    { name_en: 'Break', name_ar: 'بريك', price: 100, desc_ar: '( كيوي-مانجو)', desc_en: '(mango - kiwi)' }
  ]},
  { slug: 'milkshakes', name_en: 'Milkshakes', name_ar: 'ميلك شيك', items: [
    { name_en: 'Milkshake', name_ar: 'ميلك شيك', price: 85, desc_ar: '( مانجو-  فراولة-  شوكوالتة- فانيليا)', desc_en: '(Vanilla - Chocolate - Strawberry - Mango)' },
    { name_en: 'Milkshake Pistachio', name_ar: 'ميلك شيك بيستاشيو', price: 95, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Watermelon', name_ar: 'ميلك شيك بطيخ', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Caramel', name_ar: 'ميلك شيك كراميل', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Lemon Mint', name_ar: 'ميلك شيك ليمون نعناع', price: 95, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Nuts', name_ar: 'ميلك شيك مكسرات', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Oreo', name_ar: 'ميلك شيك أوريو', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Blueberry', name_ar: 'ميلك شيك بلو بيري', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Ho Hos', name_ar: 'ميلك شيك هوهوز', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Kit Kat', name_ar: 'ميلك شيك كيت كات', price: 100, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Nutella', name_ar: 'ميلك شيك نوتيال', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Snickers', name_ar: 'ميلك شيك سنيكرز', price: 100, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Cotton Candy', name_ar: 'ميلك شيك غزل بنات', price: 95, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Lotus', name_ar: 'ميلك شيك لوتس', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Berries Yogurt', name_ar: 'ميلك شيك زبادي توت', price: 95, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Twinkies', name_ar: 'ميلك شيك توينكيز', price: 95, desc_ar: '', desc_en: '' },
    { name_en: 'Milkshake Peach', name_ar: 'ميلك شيك خوخ', price: 90, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'smoothies', name_en: 'SMOOTHIES', name_ar: 'سموزي', items: [
    { name_en: 'Smoothie Kiwi', name_ar: 'سموزى مانجو كيوى', price: 95, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Mango', name_ar: 'سموزى مانجو', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Strawberry', name_ar: 'سموزى فراولة', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Watermelon', name_ar: 'سموزى بطيخ', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Blueberry', name_ar: 'سموزی بلو بيري', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Kiwi', name_ar: 'سموزى كيوى', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Mango Vanilla', name_ar: 'سموزى مانجو فانيليا', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Peach', name_ar: 'سموزی خوخ', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Kiwi Lemon Mint', name_ar: 'سموزى ليمون نعناع كيوى', price: 95, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Lemon Mint', name_ar: 'سموزي ليمون نعناع', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Passion Fruit', name_ar: 'سموزی باشون فروت', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Smoothie Orange Peach', name_ar: 'سموزي خوخ برتقال', price: 90, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'hot-drinks', name_en: 'Hot Drinks', name_ar: 'مشرواب ت ساخنة', items: [
    { name_en: 'Hot Cidar', name_ar: 'هوت سيدار', price: 60, desc_ar: '', desc_en: '' },
    { name_en: 'Tea', name_ar: 'شای', price: 25, desc_ar: '', desc_en: '' },
    { name_en: 'Tea Pot', name_ar: 'شاي براد', price: 40, desc_ar: '', desc_en: '' },
    { name_en: 'Green Tea', name_ar: 'شاي اخضر', price: 30, desc_ar: '', desc_en: '' },
    { name_en: 'Earl Grey Tea', name_ar: 'شاي أيرل جراي', price: 35, desc_ar: '', desc_en: '' },
    { name_en: 'Milk Tea', name_ar: 'شاي بلبن', price: 35, desc_ar: '', desc_en: '' },
    { name_en: 'Anise', name_ar: 'ينسون', price: 35, desc_ar: '', desc_en: '' },
    { name_en: 'Cinnamon', name_ar: 'قرفة', price: 40, desc_ar: '', desc_en: '' },
    { name_en: 'Ginger', name_ar: 'جنزبيل', price: 40, desc_ar: '', desc_en: '' },
    { name_en: 'Mix Herbs', name_ar: 'مكس اعشاب', price: 55, desc_ar: '', desc_en: '' },
    { name_en: 'Hot Chocolate', name_ar: 'هوت شوكليت', price: 60, desc_ar: '', desc_en: '' },
    { name_en: 'Hot Oreo', name_ar: 'هوت أوريو', price: 70, desc_ar: '', desc_en: '' },
    { name_en: 'Sahlab Nuts', name_ar: 'سحلب مكسرات', price: 80, desc_ar: '', desc_en: '' },
    { name_en: 'Sahlab Fruit', name_ar: 'سحلب فواكة', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Hummus (Seasonal)', name_ar: '(موسمي)حمص الشام', price: 75, desc_ar: '', desc_en: '' },
    { name_en: 'Hibiscus', name_ar: 'كركديه', price: 35, desc_ar: '', desc_en: '' },
    { name_en: 'Hot Lotus', name_ar: 'هوت لوتس', price: 60, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'fresh-juice', name_en: 'Fresh Juice', name_ar: 'عصائر فريش', items: [
    { name_en: 'Dates', name_ar: 'بلح باللبن', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Mango', name_ar: 'مانجو', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Strawberry', name_ar: 'فراولة', price: 80, desc_ar: '', desc_en: '' },
    { name_en: 'Guava', name_ar: 'جوافة', price: 80, desc_ar: '', desc_en: '' },
    { name_en: 'Kiwi', name_ar: 'كيوي', price: 95, desc_ar: '', desc_en: '' },
    { name_en: 'Orange', name_ar: 'برتقال', price: 80, desc_ar: '', desc_en: '' },
    { name_en: 'Watermelon', name_ar: 'بطيخ', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Banana with milk', name_ar: 'موز حليب', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Lemon', name_ar: 'ليمون', price: 70, desc_ar: '', desc_en: '' },
    { name_en: 'Lemon Mint', name_ar: 'ليمون نعناع', price: 75, desc_ar: '', desc_en: '' },
    { name_en: 'Avocado', name_ar: 'أفوكادو', price: 130, desc_ar: '', desc_en: '' },
    { name_en: 'Avocado Nuts', name_ar: 'أفوكادو مكسرات و عسل', price: 150, desc_ar: '', desc_en: '' },
    { name_en: 'Avocado Power', name_ar: 'أفوكادو باور', price: 160, desc_ar: '', desc_en: '' },
    { name_en: 'Sweet Melon', name_ar: 'كنتالوب', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Avocado World', name_ar: 'عالم االفوكادو', price: 160, desc_ar: '( عسل-  بلح- أفاوكادو)', desc_en: '(Avocado - Dates - Honey)' },
    { name_en: 'Avocado Plan B', name_ar: 'أفوكادو بالن بي', price: 160, desc_ar: '( عسل-  كيوي-  موز- أفاوكادو)', desc_en: '(Avocado - Banana - Kiwi - Honey)' }
  ]},
  { slug: 'coffee', name_en: 'Coffee', name_ar: 'قهوة', items: [
    { name_en: 'Latte', name_ar: 'التيه', price: 75, desc_ar: '', desc_en: '' },
    { name_en: 'French Coffee', name_ar: 'قهوة فرنساوى', price: 45, desc_ar: '', desc_en: '' },
    { name_en: 'Hazelnut Coffee', name_ar: 'قهوة بندق', price: 45, desc_ar: '', desc_en: '' },
    { name_en: 'Espresso Macchiato', name_ar: 'أسبرسو ميكاتو', price: 50, desc_ar: '', desc_en: '' },
    { name_en: 'Espresso Affogato', name_ar: 'أسبرسو أفوكاتو', price: 55, desc_ar: '', desc_en: '' },
    { name_en: 'Pistachio Latte', name_ar: 'التيه بيستاشيو', price: 80, desc_ar: '', desc_en: '' },
    { name_en: 'Americano', name_ar: 'أمريكانو', price: 70, desc_ar: '', desc_en: '' },
    { name_en: 'Cappuccino', name_ar: 'كابتشينو', price: 75, desc_ar: '', desc_en: '' },
    { name_en: 'Spanish Latte', name_ar: 'سبانش التيه', price: 80, desc_ar: '', desc_en: '' },
    { name_en: 'Nescafe milk', name_ar: 'نسكافية حليب', price: 65, desc_ar: '', desc_en: '' },
    { name_en: 'Nescafe', name_ar: 'نسكافية', price: 45, desc_ar: '', desc_en: '' },
    { name_en: 'Mocha Dark', name_ar: 'موكا دارك', price: 80, desc_ar: '', desc_en: '' },
    { name_en: 'Turkish Coffee', name_ar: 'قهوة تركي', price: '35/45', desc_ar: '( دبل- سنجل)', desc_en: '(Single - Double)' },
    { name_en: 'Espresso', name_ar: 'اسبرسو', price: '45/55', desc_ar: '( دبل- سنجل)', desc_en: '(Single - Double)' },
    { name_en: 'Espresso Spanish', name_ar: 'اسبرسو سبانش', price: '60/65', desc_ar: '( دبل- سنجل)', desc_en: '(Single - Double)' },
    { name_en: 'Mocha Caramel', name_ar: 'موكا كراميل', price: 80, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'ice-cream', name_en: 'Ice Cream', name_ar: 'أيس كريم', items: [
    { name_en: 'Ice Cream 1 Scope', name_ar: 'بولة1 أيس كريم', price: 30, desc_ar: '', desc_en: '' },
    { name_en: 'Ice Cream 2 Scope', name_ar: 'بولة2 أيس كريم', price: 50, desc_ar: '', desc_en: '' },
    { name_en: 'Ice Cream 3 Scope', name_ar: 'بولة3 أيس كريم', price: 70, desc_ar: '', desc_en: '' },
    { name_en: 'Ice Cream Oreo', name_ar: 'أيس كريم أوريو', price: 80, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'cold-drinks', name_en: 'Cold Drinks', name_ar: 'مشروابت مثلجة', items: [
    { name_en: 'Ice Latte Flavors', name_ar: 'أيس التيه نكهات', price: 90, desc_ar: '( كراميل-  فانيليا- بندق)', desc_en: '(Hazelnut - Vanilla - Caramel)' },
    { name_en: 'Ice Choclate Flavor', name_ar: 'آيس شوكلت فليفور', price: 95, desc_ar: '', desc_en: '' },
    { name_en: 'Ice Chocolate', name_ar: 'أيس شوكلت', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Ice Moccha', name_ar: 'ايس موكا', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Ice Latte', name_ar: 'أيس التيه', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Ice Spanish Latte', name_ar: 'أيس سبانش التيه', price: 95, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'frappe', name_en: 'Frappé', name_ar: 'فرابيه', items: [
    { name_en: 'Frappе Classic', name_ar: 'فرابيه كالسيك', price: 90, desc_ar: '', desc_en: '' },
    { name_en: 'Frappе Flavors', name_ar: 'فرابيه نكهات', price: 100, desc_ar: '(  كراميل- بيشتاشيو- شوكوالتة)', desc_en: '(Chocolate - Pistachio - Caramel)' }
  ]},
  { slug: 'frappuccino', name_en: 'Frappuccino', name_ar: 'فرابتشينو', items: [
    { name_en: 'Frappuccino Classic', name_ar: 'فرابتشينو كالسيك', price: 95, desc_ar: '', desc_en: '' },
    { name_en: 'Frappuccino Flavors', name_ar: 'فرابتشينو نكهات', price: 105, desc_ar: '( كراميل- شوكوالتة)', desc_en: '(Chocolate - Caramel)' }
  ]},
  { slug: 'shisha', name_en: 'Shisha', name_ar: 'شيشة', items: [
    { name_en: 'Classic Shisha', name_ar: 'شيشة معسل', price: 25, desc_ar: '( سلوم- قص)', desc_en: '(Qass - Saloum)' },
    { name_en: 'Shisha Fruit', name_ar: 'شيشة فواكه', price: 110, desc_ar: '', desc_en: '' },
    { name_en: 'Shisha Mix', name_ar: 'شيشة مكس', price: 120, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'desserts', name_en: 'Desserts', name_ar: 'حلوايت / Desserts', items: [
    { name_en: 'Fruit Salad Ice Cream', name_ar: 'فروت سالط ايس كريم', price: 105, desc_ar: '', desc_en: '' },
    { name_en: 'Walnut Tart', name_ar: 'تارت عين جمل', price: 120, desc_ar: '', desc_en: '' },
    { name_en: 'Waffle', name_ar: 'وافل', price: 85, desc_ar: '( كراميل- شوكوالتة)', desc_en: '(Chocolate - Caramel)' },
    { name_en: 'Chocolate Cake', name_ar: 'شوكليت كيك', price: 100, desc_ar: '', desc_en: '' },
    { name_en: 'Cheese Cake', name_ar: 'تشيز كيك', price: 105, desc_ar: '', desc_en: '' },
    { name_en: 'Red Velvet', name_ar: 'ريد فيلفت', price: 100, desc_ar: '', desc_en: '' },
    { name_en: 'Molten Cake', name_ar: 'مولتن كيك', price: 105, desc_ar: '', desc_en: '' },
    { name_en: 'Waffle', name_ar: 'وافل', price: 95, desc_ar: '( فروت-  بيستاشيو-نوتيال)', desc_en: '(Nutella - Pistachio - Fruit)' },
    { name_en: 'Tiramisu', name_ar: 'تيراميسو', price: 100, desc_ar: '', desc_en: '' },
    { name_en: 'Zalabia', name_ar: 'زالبية', price: 75, desc_ar: '', desc_en: '' },
    { name_en: 'Om Ali', name_ar: 'أم علي', price: 85, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'soda-cocktails', name_en: 'Soda Cocktails', name_ar: 'صودا كوكتيل', items: [
    { name_en: 'Blue Electric', name_ar: 'بلو أليكترك', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Sunshine', name_ar: 'صن شاين', price: 85, desc_ar: '', desc_en: '' },
    { name_en: 'Plan B', name_ar: 'بالن بي', price: 90, desc_ar: '( نعناع-  ليمون-  سبراست-  عصير اناناس- كيوي)', desc_en: '(Kiwi - Pineapple - Sprite - Lemon - Mint)' }
  ]},
  { slug: 'mojito', name_en: 'Mojito', name_ar: 'موهيتو', items: [
    { name_en: 'Mojita', name_ar: 'موهيتو', price: 80, desc_ar: '', desc_en: '' },
    { name_en: 'Mojito Flavors', name_ar: 'موهيتو نكهات', price: 85, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'soft-drinks', name_en: 'Soft Drinks', name_ar: 'مشروابت غازية', items: [
    { name_en: 'Cola - Sprite - Fanta', name_ar: 'فانتا-  سبرايت- كوال', price: 35, desc_ar: '', desc_en: '' },
    { name_en: 'Fayrouz', name_ar: 'فيروز', price: 40, desc_ar: '', desc_en: '' },
    { name_en: 'Birell', name_ar: 'بيريل', price: 40, desc_ar: '', desc_en: '' },
    { name_en: 'Schweppes Gold', name_ar: 'شوييس جولد', price: 40, desc_ar: '', desc_en: '' },
    { name_en: 'Soda - Tonic Water', name_ar: 'تونيك- صودا', price: 45, desc_ar: '', desc_en: '' },
    { name_en: 'RedBull', name_ar: 'ريد بول', price: 95, desc_ar: '', desc_en: '' }
  ]},
  { slug: 'water', name_en: 'Water', name_ar: 'مياة', items: [
    { name_en: 'Small Water', name_ar: 'مياة صغيرة', price: 15, desc_ar: '', desc_en: '' },
    { name_en: 'Large Water', name_ar: 'مياة كبيرة', price: 25, desc_ar: '', desc_en: '' }
  ]}
];

function toNumericPrice(price: number | string) {
  if (typeof price === 'number') return price;
  const [first] = price.split('/');
  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPriceText(price: number | string) {
  return typeof price === 'string' ? price : null;
}

async function run() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const categoryPayload = MENU.map((category, index) => ({
    slug: category.slug,
    name_ar: category.name_ar,
    name_en: category.name_en,
    sort_order: index,
    is_active: true
  }));

  const { error: categoryError } = await supabase.from('categories').upsert(categoryPayload, { onConflict: 'slug' });
  if (categoryError) throw categoryError;

  const { data: categories, error: categoriesError } = await supabase.from('categories').select('id,slug');
  if (categoriesError) throw categoriesError;

  const categoryBySlug = new Map((categories ?? []).map((c) => [c.slug, c.id as string]));

  const { data: existingItems, error: existingItemsError } = await supabase
    .from('items')
    .select('id,category_id,name_ar,name_en');
  if (existingItemsError) throw existingItemsError;

  const existingItemByKey = new Map(
    (existingItems ?? []).map((item) => [`${item.category_id ?? 'none'}::${item.name_ar}::${item.name_en}`, item.id as string])
  );

  const itemPayload = MENU.flatMap((category) => {
    const categoryId = categoryBySlug.get(category.slug);
    if (!categoryId) return [];

    return category.items.map((item, index) => {
      const key = `${categoryId}::${item.name_ar}::${item.name_en}`;
      const maybeId = existingItemByKey.get(key);
      return {
        ...(maybeId ? { id: maybeId } : {}),
        category_id: categoryId,
        name_ar: item.name_ar,
        name_en: item.name_en,
        desc_ar: item.desc_ar,
        desc_en: item.desc_en,
        price: toNumericPrice(item.price),
        price_text: toPriceText(item.price),
        image_url: '',
        tags: [],
        sort_order: index,
        is_available: true
      };
    });
  });

  const { error: itemError } = await supabase.from('items').upsert(itemPayload);
  if (itemError) throw itemError;

  const { error: settingsError } = await supabase
    .from('settings')
    .upsert({
      id: 1,
      tax_percent: 14,
      vat_note_ar: 'ضريبة %14 يضاف',
      vat_note_en: 'All Prices are subjected to 14% VAT Tax',
      mains_note_ar: MAIN_DISHES_NOTE_AR,
      mains_note_en: MAIN_DISHES_NOTE_EN
    });
  if (settingsError) throw settingsError;

  console.log(`Seed complete: ${MENU.length} categories and ${itemPayload.length} items upserted.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
