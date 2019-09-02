const Survey = require('./models/survey');
const uniqueRandom = require('unique-random');
const Order = require('./models/order');

const ownerName = ['বশির আলি', 'বাবুল হোসেন', 'আফসার হোসেন', 'শহিদুল আলম', 'ফখরুল ইসলাম', 'নজরুল ইসলাম', 'নাহিদুল ইসলাম', 'ছমির মিয়া', 'আব্দুস সাত্তার', 'চান মিয়া সওদাগর']
const motherName = ['সালমা খাতুন', 'জরিনা বেগম', 'সখিনা খাতুন', 'সাহারা খাতুন', 'সীমা আক্তার', 'আফসানা রহমান', 'ফুলবানু আক্তার', 'রেবেকা চৌধুরী', 'আকলিমা আক্তার', 'মিনারা বেগম']
const areaName = ['ঢাকা', 'সাভার', 'গাজীপুর', 'বিক্রমপুর', 'ডেমরা', 'সবুজবাগ', 'ওয়ারি', 'মিরপুর', 'ফার্মগেট', 'উত্তরা']
const age = ['৫০', '৬০', '৫২', '৪৫', '৩৫', '৪৮', '৬৩', '৫৩', '৪৬', '৬১']
const occupation = ['চাকরিজীবি', 'কৃষক', 'অবসরপ্রাপ্ত', 'ব্যবসায়ী', 'গৃহিনী', 'শিক্ষক', 'ডাক্তার', 'রাজনীতিবিদ', 'দিন মজুর', 'বেকার']
const holding = ['135/2', '132/A', '52/C', '85/R', '232/5', '91/8', '789/F', '123/4', '851/4', '81/1']
const block = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const mobile = []
const orderStatus = ['In progress...', 'Delivered', 'Canceled']
const ward = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

for (let i = 0; i < 1000; i++) {
    let temp = uniqueRandom(11111, 100000000000)
    mobile.push(temp());
}

const holdingType = ['আবাসিক', 'বাণিজ্যিক', 'দোকান', 'শিল্প প্রতিষ্ঠান', 'উপসনালয়', 'সরকারি প্রতিষ্ঠান', 'হাসপাতাল', 'ক্লাব', 'এনজিও', 'অন্যান্য']
const holdingStructure = ['পাকা', 'আধা পাকা', 'কাঁচা']
const ownership = ['ভাড়া', 'নিজস্ব', 'কেয়ারটেকার']
// const waterSource = ['সাপ্লাই', 'টিউবওয়েল', 'পুকুর']
const sanitation = ['পাকা', 'কাঁচা', 'আধা পাকা']
const gas = ['আছে', 'নেই', 'সিলিন্ডার']
const freedom = ['হ্যাঁ', 'না', 'অনিবন্ধিত']
const roadType = ['কাঁচা', 'আর সি সি', 'এইচ বি বি', 'ফ্ল্যাট সোলিং', 'কার্পেটিং', 'সি সি', 'কার্পেটিং', 'অন্যান্য', 'অন্যান্য', 'অন্যান্য']
const paid = ['হ্যাঁ', 'না', 'বকেয়া']
const plate = ['৬ * ৯ ইঞ্চি', '৮ * ১২ ইঞ্চি']
async function seed() {
    // const orders = await Order.find()
    for (let i = 0; i < 40; i++) {
        const random1 = uniqueRandom(0, 9);
        const random2 = uniqueRandom(0, 2);
        const random3 = uniqueRandom(200, 500)
        const random4 = uniqueRandom(0, 9)
        const random5 = uniqueRandom(0, 999);
        const random = uniqueRandom(1, 100000000000);

        try {
            const survey = await new Survey({
                assessment_id: random(),
                ownerName: ownerName[random1()],
                fatherName: ownerName[random1() + 2],
                motherName: motherName[random1()],
                ward: ward[random4()],
                age: age[random1()],
                occupation: occupation[random1()],
                road: areaName[random1()],
                postcode: random3(),
                holding: holding[random1()],
                thana: areaName[random4()],
                freedomFighter: freedom[random2()],
                mobile: mobile[random5()],
                id: random(),
                holdingType: holdingType[random2()],
                holdingName: ownerName[random1()] + ' হাউজিং',
                holdingStructure: holdingStructure[random2()],
                length: random5(),
                wide: random3(),
                volume: random3() * random5(),
                ownership: ownership[random2()],
                rent: random3() * 80,
                maleMember: random4(),
                femaleMember: random2(),
                totalMember: this.maleMember + this.femaleMember,
                yearlyIncome: String(random3() * random3()),
                waterSource: paid[random2()],
                sanitationStatus: sanitation[random2()],
                gasConnection: gas[random2()],
                yearlyTax: String(random1() * random3()),
                roadExist: paid[random2()],
                roadType: roadType[random1()],
                streetlight: paid[random2()],
                orderPaid: paid[random2()],
                orderStatus: orderStatus[random2()],
                plateSize: plate[0],
                created: new Date().toDateString(),
                updated: new Date().toDateString()
            })

            await survey.save()
        } catch (err) {
            console.log('Something wrong!');
        }

    }
}


module.exports = seed;