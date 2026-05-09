export const TIERS = ["pre-sale", "vip", "standard"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_LABEL: Record<Tier, string> = {
  "pre-sale": "PRE-SALE",
  vip: "VIP",
  standard: "STANDARD",
};

export const TIER_PREFIX: Record<Tier, string> = {
  "pre-sale": "PS",
  vip: "VIP",
  standard: "ST",
};

export type SocialKind =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "telegram"
  | "linkedin"
  | "website";

export type SocialLink = {
  kind: SocialKind;
  url: string;
  label?: string;
};

export type Speaker = {
  slug: string;
  name: { kk: string; en: string };
  title: { kk: string; en: string };
  bio?: { kk: string; en: string };
  photoUrl?: string;
  socials?: SocialLink[];
  brands?: SocialLink[];
};

export type EventConfig = {
  name: { kk: string; en: string };
  theme: { kk: string; en: string };
  themeDescription: { kk: string; en: string };
  date: string; // ISO
  dateLabel: { kk: string; en: string };
  venue: { kk: string; en: string };
  city: { kk: string; en: string };
  speakers: Speaker[];
};

export const event: EventConfig = {
  name: {
    kk: "TEDxZhenysPark",
    en: "TEDxZhenysPark",
  },
  theme: {
    kk: "Жаңғыру",
    en: "Renewal",
  },
  themeDescription: {
    kk: "Идеялардың күші арқылы жаңғыру мен өзгеріске шабыттандыратын форум.",
    en: "A forum that inspires renewal and change through the power of ideas.",
  },
  date: "2026-05-30",
  dateLabel: {
    kk: "30 мамыр 2026",
    en: "May 30, 2026",
  },
  venue: {
    kk: "Caravan Saray Arena",
    en: "Caravan Saray Arena",
  },
  city: {
    kk: "Түркістан",
    en: "Turkestan",
  },
  speakers: [
    {
      slug: "kultay-adilova",
      name: {
        kk: "Күлтай Ағытайқызы Әділова",
        en: "Kultay Agytaykyzy Adilova",
      },
      title: {
        kk: "«Ұлытау университеті» вице-ректоры",
        en: "Vice-rector of Ulytau University",
      },
      bio: {
        kk: "Заңгер, қауымдастырылған профессор, жоғары білім және ғылым саласының сарапшысы, «Ұлытау университеті» вице-ректоры.",
        en: "Lawyer, associate professor, higher-education and science expert, vice-rector of Ulytau University.",
      },
      photoUrl: "/speakers/kultay-adilova.png",
      socials: [
        { kind: "instagram", url: "https://www.instagram.com/adilova.official/", label: "@adilova.official" },
      ],
    },
    {
      slug: "ayat-azimov",
      name: { kk: "Аят Азимов", en: "Ayat Azimov" },
      title: {
        kk: "Global Coffee негізін қалаушы",
        en: "Founder of Global Coffee",
      },
      bio: {
        kk: "Қазақстандағы ең жылдам дамып келе жатқан кофеханалар желісі — Global Coffee-дің негізін қалаушы және тең иесі. Сериялық кәсіпкер және инвестор, халықаралық деңгейде 5 елде 75-тен астам кофе нүктесін басқаратын бизнестің серіктесі.",
        en: "Founder and co-owner of Global Coffee — Kazakhstan's fastest-growing coffee chain. Serial entrepreneur and investor running 75+ coffee venues across 5 countries.",
      },
      photoUrl: "/speakers/ayat-azimov.jpg",
      socials: [
        { kind: "instagram", url: "https://www.instagram.com/ayatazimov/", label: "@ayatazimov" },
        { kind: "instagram", url: "https://www.instagram.com/global_coffee_kz/", label: "@global_coffee_kz" },
        { kind: "website", url: "https://ayatazimov.com/", label: "ayatazimov.com" },
      ],
    },
    {
      slug: "aliya-ospanova",
      name: {
        kk: "Алия Қалқаманқызы Оспанова",
        en: "Aliya Qalqamankyzy Ospanova",
      },
      title: {
        kk: "«Цифрлық үкіметті қолдау орталығы» РГП бас директоры",
        en: "CEO, Digital Government Support Center",
      },
      bio: {
        kk: "Қазақстанның цифрлық даму, білім беру және халықаралық жобаларды басқару саласындағы маманы. 2026 жылдың наурызынан бастап «Цифрлық үкіметті қолдау орталығы» РГП-ның бас директоры қызметін атқарады. Бұған дейін «Халықаралық бағдарламалар орталығының» (Болашақ) басшысы болған.",
        en: "Specialist in Kazakhstan's digital development, education and international project management. Since March 2026 — CEO of the Digital Government Support Center; previously headed the Center for International Programmes (Bolashak).",
      },
      photoUrl: "/speakers/aliya-ospanova.png",
      socials: [
        { kind: "instagram", url: "https://www.instagram.com/aliya_ospanovaaa/", label: "@aliya_ospanovaaa" },
        { kind: "facebook", url: "https://www.facebook.com/aliyasha.ospanova", label: "Facebook" },
        { kind: "linkedin", url: "https://www.linkedin.com/in/aliya-ospanova/", label: "LinkedIn" },
      ],
    },
    {
      slug: "ardan-galymuly",
      name: { kk: "Ардан Ғалымұлы", en: "Ardan Galymuly" },
      title: {
        kk: "Спортшы, блогер, стендап-комик",
        en: "Athlete, blogger, stand-up comedian",
      },
      bio: {
        kk: "Спортшы, блогер және стендап-комик. Өзінің жігерлілігімен және позитивті энергиясымен танымал.",
        en: "Athlete, blogger and stand-up comedian. Known for his drive and positive energy.",
      },
      photoUrl: "/speakers/ardan-galymuly.png",
      socials: [
        { kind: "instagram", url: "https://www.instagram.com/ardan_galymuly/", label: "@ardan_galymuly" },
      ],
    },
    {
      slug: "nazym-zhangazy",
      name: { kk: "Назым Жанғазы", en: "Nazym Zhangazy" },
      title: {
        kk: "Медиамаман, саяси консультант, волонтер және блогер",
        en: "Media specialist, political consultant, volunteer and blogger",
      },
      bio: {
        kk: "Қазақстан Республикасының Әйелдер істері және отбасылық-демографиялық саясат жөніндегі ұлттық комиссия мүшесі, Қазақстан Бочча федерациясының вице-президенті.",
        en: "Member of Kazakhstan's National Commission on Women's Affairs and Family-Demographic Policy, vice-president of the Kazakhstan Boccia Federation.",
      },
      photoUrl: "/speakers/nazym-zhangazy.png",
      socials: [
        { kind: "instagram", url: "https://www.instagram.com/nazym.zhangazy/", label: "@nazym.zhangazy" },
        { kind: "youtube", url: "https://www.youtube.com/@NazymZhangazy", label: "@NazymZhangazy" },
        { kind: "telegram", url: "https://t.me/ZhangazinovaN", label: "@ZhangazinovaN" },
      ],
    },
    {
      slug: "aigerim-kusayinkyzy",
      name: { kk: "Айгерім Құсайынқызы", en: "Aigerim Kusayinkyzy" },
      title: {
        kk: "LLM, PhD кандидат, гендерлік теңдік бойынша эксперт",
        en: "LLM, PhD candidate, gender equality expert",
      },
      bio: {
        kk: "LLM, PhD кандидат, гендерлік теңдік бойынша эксперт, фембике белсенді.",
        en: "LLM, PhD candidate, gender equality expert and feminist activist.",
      },
      photoUrl: "/speakers/aigerim-kusayinkyzy.png",
      socials: [
        { kind: "instagram", url: "https://www.instagram.com/kussaiynkyzy/", label: "@kussaiynkyzy" },
        { kind: "tiktok", url: "https://www.tiktok.com/@kussaiynkyzy1225", label: "@kussaiynkyzy1225" },
      ],
    },
    {
      slug: "orken-kenzhebek",
      name: { kk: "Өркен Кенжебек", en: "Orken Kenzhebek" },
      title: {
        kk: "Журналист, блогер, саяхатшы",
        en: "Journalist, blogger, traveler",
      },
      bio: {
        kk: "Танымал қазақстандық журналист, блогер (16 жылдан астам тәжірибесі бар) және 70-тен астам елді аралаған саяхатшы. Әлеуметтік желі этикасы, қоғамдық мәселелер мен блог мәдениетін көтереді. «Хабар» агенттігінде қызмет еткен, Brand Ambassador ретінде танымал тұлға.",
        en: "Well-known Kazakh journalist, blogger (16+ years) and traveler who has visited 70+ countries. Speaks on social-media ethics, civic issues and blog culture. Former Khabar Agency employee; recognized Brand Ambassador.",
      },
      photoUrl: "/speakers/orken-kenzhebek.png",
      socials: [
        { kind: "instagram", url: "https://www.instagram.com/orkeni/", label: "@orkeni" },
      ],
      brands: [
        { kind: "instagram", url: "https://www.instagram.com/tary.coffee/", label: "@tary.coffee" },
        { kind: "instagram", url: "https://www.instagram.com/argymaq/", label: "@argymaq" },
        { kind: "instagram", url: "https://www.instagram.com/zerdeli.group/", label: "@zerdeli.group" },
      ],
    },
    {
      slug: "inara-namazbayeva",
      name: { kk: "Инара Намазбаева", en: "Inara Namazbayeva" },
      title: {
        kk: "Түркістан облыстық мәслихатының депутаты",
        en: "Deputy of the Turkestan Regional Maslikhat",
      },
      bio: {
        kk: "Түркістан облыстық мәслихатының депутаты, «Қазақстанның іскер әйелдер ассоциациясы» Түркістан облыстық филиалының төрайымы және Гражданлық альянс басшысы. Өңірдегі әлеуметтік мәселелерді, ана мен бала қолдауын шешуге белсенді қатысатын қоғам қайраткері.",
        en: "Deputy of the Turkestan Regional Maslikhat, chair of the Turkestan branch of the Kazakhstan Business Women's Association and head of the Civil Alliance. Active civic figure focused on regional social issues and support for mothers and children.",
      },
      photoUrl: "/speakers/inara-namazbayeva.png",
      socials: [
        { kind: "instagram", url: "https://www.instagram.com/inara.abdigapparkyzy/", label: "@inara.abdigapparkyzy" },
        { kind: "facebook", url: "https://www.facebook.com/profile.php?id=100038291794421", label: "Facebook" },
      ],
    },
  ],
};


export const contacts = {
  whatsapp: process.env.NEXT_PUBLIC_MANAGER_WHATSAPP ?? "",
  telegram: process.env.NEXT_PUBLIC_MANAGER_TELEGRAM ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export function eventMapUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Caravan Saray Arena, Türkistan, Kazakhstan",
  )}`;
}

export function buildBuyTicketLink(locale: "kk" | "en") {
  const message =
    locale === "kk"
      ? `Сәлеметсіз бе! TEDxZhenysPark билетін сатып алғым келеді.`
      : `Hi! I'd like to buy a ticket to TEDxZhenysPark.`;
  if (contacts.whatsapp) {
    return `https://wa.me/${contacts.whatsapp}?text=${encodeURIComponent(message)}`;
  }
  if (contacts.telegram) {
    return `https://t.me/${contacts.telegram}`;
  }
  return "#";
}
