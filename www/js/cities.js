// Tam Vakti - Türkiye İlleri ve Tüm İlçeleri Koordinat Veritabanı
// Toplam 81 İl ve 1002 İlçe
const TURKEY_CITIES = [
  {
    "id": 1,
    "name": "Adana",
    "lat": 37.0,
    "lon": 35.3213,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.0,
        "lon": 35.3213
      },
      {
        "name": "Aladağ",
        "lat": 37.5485,
        "lon": 35.396
      },
      {
        "name": "Ceyhan",
        "lat": 37.0247,
        "lon": 35.8175
      },
      {
        "name": "Çukurova",
        "lat": 37.0,
        "lon": 35.3213
      },
      {
        "name": "Feke",
        "lat": 37.8145,
        "lon": 35.9123
      },
      {
        "name": "İmamoğlu",
        "lat": 37.2651,
        "lon": 35.6572
      },
      {
        "name": "Karaisalı",
        "lat": 36.1332,
        "lon": 32.9935
      },
      {
        "name": "Karataş",
        "lat": 36.582,
        "lon": 35.3701
      },
      {
        "name": "Kozan",
        "lat": 37.4552,
        "lon": 35.8157
      },
      {
        "name": "Pozantı",
        "lat": 37.4278,
        "lon": 34.8717
      },
      {
        "name": "Saimbeyli",
        "lat": 37.9863,
        "lon": 36.0906
      },
      {
        "name": "Sarıçam",
        "lat": 37.1517,
        "lon": 35.5077
      },
      {
        "name": "Seyhan",
        "lat": 36.9875,
        "lon": 35.3059
      },
      {
        "name": "Tufanbeyli",
        "lat": 38.2633,
        "lon": 36.2206
      },
      {
        "name": "Yumurtalık",
        "lat": 36.7686,
        "lon": 35.7894
      },
      {
        "name": "Yüreğir",
        "lat": 36.9744,
        "lon": 35.3592
      }
    ]
  },
  {
    "id": 2,
    "name": "Adıyaman",
    "lat": 37.7648,
    "lon": 38.2786,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.7648,
        "lon": 38.2786
      },
      {
        "name": "Besni",
        "lat": 37.6928,
        "lon": 37.8611
      },
      {
        "name": "Çelikhan",
        "lat": 38.0256,
        "lon": 38.2366
      },
      {
        "name": "Gerger",
        "lat": 38.0281,
        "lon": 39.0342
      },
      {
        "name": "Gölbaşı",
        "lat": 37.7836,
        "lon": 37.6367
      },
      {
        "name": "Kahta",
        "lat": 37.7855,
        "lon": 38.6237
      },
      {
        "name": "Samsat",
        "lat": 37.5819,
        "lon": 38.4742
      },
      {
        "name": "Sincik",
        "lat": 38.0365,
        "lon": 38.6126
      },
      {
        "name": "Tut",
        "lat": 37.7953,
        "lon": 37.9161
      }
    ]
  },
  {
    "id": 3,
    "name": "Afyonkarahisar",
    "lat": 38.7507,
    "lon": 30.5567,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.7507,
        "lon": 30.5567
      },
      {
        "name": "Başmakçı",
        "lat": 37.8972,
        "lon": 30.0117
      },
      {
        "name": "Bayat",
        "lat": 40.6458,
        "lon": 34.2614
      },
      {
        "name": "Bolvadin",
        "lat": 38.7111,
        "lon": 31.0486
      },
      {
        "name": "Çay",
        "lat": 39.2299,
        "lon": 42.8666
      },
      {
        "name": "Çobanlar",
        "lat": 38.7014,
        "lon": 30.7828
      },
      {
        "name": "Dazkırı",
        "lat": 37.9186,
        "lon": 29.8606
      },
      {
        "name": "Dinar",
        "lat": 38.065,
        "lon": 30.1656
      },
      {
        "name": "Emirdağ",
        "lat": 39.0197,
        "lon": 31.15
      },
      {
        "name": "Evciler",
        "lat": 37.5984,
        "lon": 28.0617
      },
      {
        "name": "Hocalar",
        "lat": 38.5782,
        "lon": 29.9677
      },
      {
        "name": "İhsaniye",
        "lat": 40.6909,
        "lon": 29.8347
      },
      {
        "name": "İscehisar",
        "lat": 38.8619,
        "lon": 30.7503
      },
      {
        "name": "Kızılören",
        "lat": 37.8685,
        "lon": 32.1162
      },
      {
        "name": "Sandıklı",
        "lat": 37.8451,
        "lon": 27.7327
      },
      {
        "name": "Sinanpaşa",
        "lat": 38.7444,
        "lon": 30.2428
      },
      {
        "name": "Sultandağı",
        "lat": 38.5311,
        "lon": 31.2281
      },
      {
        "name": "Şuhut",
        "lat": 38.5311,
        "lon": 30.5458
      }
    ]
  },
  {
    "id": 4,
    "name": "Ağrı",
    "lat": 39.7191,
    "lon": 43.0503,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.7191,
        "lon": 43.0503
      },
      {
        "name": "Diyadin",
        "lat": 39.5406,
        "lon": 43.6713
      },
      {
        "name": "Doğubayazıt",
        "lat": 39.5469,
        "lon": 44.0842
      },
      {
        "name": "Eleşkirt",
        "lat": 39.798,
        "lon": 42.6757
      },
      {
        "name": "Hamur",
        "lat": 39.6056,
        "lon": 42.985
      },
      {
        "name": "Patnos",
        "lat": 39.2249,
        "lon": 42.8569
      },
      {
        "name": "Taşlıçay",
        "lat": 39.6297,
        "lon": 43.3688
      },
      {
        "name": "Tutak",
        "lat": 39.5385,
        "lon": 42.7659
      }
    ]
  },
  {
    "id": 5,
    "name": "Amasya",
    "lat": 40.6534,
    "lon": 35.8331,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.6534,
        "lon": 35.8331
      },
      {
        "name": "Göynücek",
        "lat": 40.3992,
        "lon": 35.525
      },
      {
        "name": "Gümüşhacıköy",
        "lat": 40.8731,
        "lon": 35.2147
      },
      {
        "name": "Hamamözü",
        "lat": 40.7848,
        "lon": 35.0258
      },
      {
        "name": "Merzifon",
        "lat": 40.8733,
        "lon": 35.4631
      },
      {
        "name": "Suluova",
        "lat": 40.8313,
        "lon": 35.6479
      },
      {
        "name": "Taşova",
        "lat": 40.7597,
        "lon": 36.3225
      }
    ]
  },
  {
    "id": 6,
    "name": "Ankara",
    "lat": 39.9334,
    "lon": 32.8597,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.9334,
        "lon": 32.8597
      },
      {
        "name": "Akyurt",
        "lat": 40.1351,
        "lon": 33.0861
      },
      {
        "name": "Altındağ",
        "lat": 39.9334,
        "lon": 32.8597
      },
      {
        "name": "Ayaş",
        "lat": 40.0193,
        "lon": 32.3322
      },
      {
        "name": "Bala",
        "lat": 39.5542,
        "lon": 33.1234
      },
      {
        "name": "Beypazarı",
        "lat": 40.1675,
        "lon": 31.9211
      },
      {
        "name": "Çamlıdere",
        "lat": 40.4896,
        "lon": 32.475
      },
      {
        "name": "Çankaya",
        "lat": 39.9179,
        "lon": 32.8627
      },
      {
        "name": "Çubuk",
        "lat": 40.2386,
        "lon": 33.0322
      },
      {
        "name": "Elmadağ",
        "lat": 39.9208,
        "lon": 33.2308
      },
      {
        "name": "Etimesgut",
        "lat": 39.9533,
        "lon": 32.6328
      },
      {
        "name": "Evren",
        "lat": 40.2453,
        "lon": 39.1754
      },
      {
        "name": "Gölbaşı",
        "lat": 37.7836,
        "lon": 37.6367
      },
      {
        "name": "Güdül",
        "lat": 40.2105,
        "lon": 32.2455
      },
      {
        "name": "Haymana",
        "lat": 39.4321,
        "lon": 32.4973
      },
      {
        "name": "Kahramankazan",
        "lat": 39.9334,
        "lon": 32.8597
      },
      {
        "name": "Kalecik",
        "lat": 40.0972,
        "lon": 33.4083
      },
      {
        "name": "Keçiören",
        "lat": 39.9334,
        "lon": 32.8597
      },
      {
        "name": "Kızılcahamam",
        "lat": 40.4697,
        "lon": 32.6506
      },
      {
        "name": "Mamak",
        "lat": 39.9404,
        "lon": 32.9101
      },
      {
        "name": "Nallıhan",
        "lat": 40.1859,
        "lon": 31.3518
      },
      {
        "name": "Polatlı",
        "lat": 39.5772,
        "lon": 32.1413
      },
      {
        "name": "Pursaklar",
        "lat": 40.032,
        "lon": 32.8953
      },
      {
        "name": "Sincan",
        "lat": 39.4717,
        "lon": 37.8708
      },
      {
        "name": "Şereflikoçhisar",
        "lat": 38.9393,
        "lon": 33.5386
      },
      {
        "name": "Yenimahalle",
        "lat": 39.9334,
        "lon": 32.8597
      }
    ]
  },
  {
    "id": 7,
    "name": "Antalya",
    "lat": 36.8969,
    "lon": 30.7133,
    "districts": [
      {
        "name": "Merkez",
        "lat": 36.8969,
        "lon": 30.7133
      },
      {
        "name": "Akseki",
        "lat": 37.0486,
        "lon": 31.79
      },
      {
        "name": "Aksu",
        "lat": 40.0896,
        "lon": 38.0347
      },
      {
        "name": "Alanya",
        "lat": 36.5438,
        "lon": 31.9998
      },
      {
        "name": "Demre",
        "lat": 36.2444,
        "lon": 29.985
      },
      {
        "name": "Döşemealtı",
        "lat": 37.0233,
        "lon": 30.6025
      },
      {
        "name": "Elmalı",
        "lat": 41.139,
        "lon": 29.1297
      },
      {
        "name": "Finike",
        "lat": 36.295,
        "lon": 30.1406
      },
      {
        "name": "Gazipaşa",
        "lat": 36.2694,
        "lon": 32.3179
      },
      {
        "name": "Gündoğmuş",
        "lat": 36.8111,
        "lon": 32.0
      },
      {
        "name": "İbradı",
        "lat": 37.0969,
        "lon": 31.5992
      },
      {
        "name": "Kaş",
        "lat": 36.2018,
        "lon": 29.6377
      },
      {
        "name": "Kemer",
        "lat": 36.5978,
        "lon": 30.5606
      },
      {
        "name": "Kepez",
        "lat": 36.9158,
        "lon": 30.7078
      },
      {
        "name": "Konyaaltı",
        "lat": 36.8664,
        "lon": 30.6303
      },
      {
        "name": "Korkuteli",
        "lat": 37.065,
        "lon": 30.1957
      },
      {
        "name": "Kumluca",
        "lat": 40.7756,
        "lon": 31.3292
      },
      {
        "name": "Manavgat",
        "lat": 36.7867,
        "lon": 31.4409
      },
      {
        "name": "Muratpaşa",
        "lat": 36.8916,
        "lon": 30.765
      },
      {
        "name": "Serik",
        "lat": 36.9175,
        "lon": 31.1046
      }
    ]
  },
  {
    "id": 8,
    "name": "Artvin",
    "lat": 41.1828,
    "lon": 41.8183,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.1828,
        "lon": 41.8183
      },
      {
        "name": "Ardanuç",
        "lat": 41.1195,
        "lon": 42.0688
      },
      {
        "name": "Arhavi",
        "lat": 41.3512,
        "lon": 41.3046
      },
      {
        "name": "Borçka",
        "lat": 41.3579,
        "lon": 41.6658
      },
      {
        "name": "Hopa",
        "lat": 41.3905,
        "lon": 41.4197
      },
      {
        "name": "Kemalpaşa",
        "lat": 41.4834,
        "lon": 41.5275
      },
      {
        "name": "Murgul",
        "lat": 41.2805,
        "lon": 41.5644
      },
      {
        "name": "Şavşat",
        "lat": 41.2534,
        "lon": 42.3553
      },
      {
        "name": "Yusufeli",
        "lat": 40.8204,
        "lon": 41.5374
      }
    ]
  },
  {
    "id": 9,
    "name": "Aydın",
    "lat": 37.856,
    "lon": 27.8416,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.856,
        "lon": 27.8416
      },
      {
        "name": "Bozdoğan",
        "lat": 36.6946,
        "lon": 33.2233
      },
      {
        "name": "Buharkent",
        "lat": 37.964,
        "lon": 28.7427
      },
      {
        "name": "Çine",
        "lat": 37.6127,
        "lon": 28.0591
      },
      {
        "name": "Didim",
        "lat": 37.385,
        "lon": 27.2564
      },
      {
        "name": "Efeler",
        "lat": 37.856,
        "lon": 27.8416
      },
      {
        "name": "Germencik",
        "lat": 37.8706,
        "lon": 27.6028
      },
      {
        "name": "İncirliova",
        "lat": 37.8522,
        "lon": 27.7236
      },
      {
        "name": "Karacasu",
        "lat": 37.7282,
        "lon": 28.6057
      },
      {
        "name": "Karpuzlu",
        "lat": 37.5586,
        "lon": 27.8353
      },
      {
        "name": "Koçarlı",
        "lat": 37.7611,
        "lon": 27.7058
      },
      {
        "name": "Köşk",
        "lat": 37.8533,
        "lon": 28.0517
      },
      {
        "name": "Kuşadası",
        "lat": 37.8601,
        "lon": 27.2571
      },
      {
        "name": "Kuyucak",
        "lat": 37.8631,
        "lon": 38.3436
      },
      {
        "name": "Nazilli",
        "lat": 37.9163,
        "lon": 28.3223
      },
      {
        "name": "Söke",
        "lat": 37.7482,
        "lon": 27.4061
      },
      {
        "name": "Sultanhisar",
        "lat": 37.8899,
        "lon": 28.1544
      },
      {
        "name": "Yenipazar",
        "lat": 40.1783,
        "lon": 30.52
      }
    ]
  },
  {
    "id": 10,
    "name": "Balıkesir",
    "lat": 39.6484,
    "lon": 27.8826,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.6484,
        "lon": 27.8826
      },
      {
        "name": "Altıeylül",
        "lat": 39.6484,
        "lon": 27.8826
      },
      {
        "name": "Ayvalık",
        "lat": 39.3193,
        "lon": 26.6934
      },
      {
        "name": "Balya",
        "lat": 39.7486,
        "lon": 27.5789
      },
      {
        "name": "Bandırma",
        "lat": 40.3522,
        "lon": 27.9767
      },
      {
        "name": "Bigadiç",
        "lat": 39.3925,
        "lon": 28.1311
      },
      {
        "name": "Burhaniye",
        "lat": 39.5004,
        "lon": 26.9727
      },
      {
        "name": "Dursunbey",
        "lat": 39.586,
        "lon": 28.6257
      },
      {
        "name": "Edremit",
        "lat": 39.5961,
        "lon": 27.0244
      },
      {
        "name": "Erdek",
        "lat": 40.3996,
        "lon": 27.7935
      },
      {
        "name": "Gömeç",
        "lat": 39.3902,
        "lon": 26.8413
      },
      {
        "name": "Gönen",
        "lat": 40.1049,
        "lon": 27.654
      },
      {
        "name": "Havran",
        "lat": 39.5583,
        "lon": 27.0983
      },
      {
        "name": "İvrindi",
        "lat": 39.5839,
        "lon": 27.4864
      },
      {
        "name": "Karesi",
        "lat": 39.6484,
        "lon": 27.8826
      },
      {
        "name": "Kepsut",
        "lat": 39.6889,
        "lon": 28.1522
      },
      {
        "name": "Manyas",
        "lat": 40.0464,
        "lon": 27.97
      },
      {
        "name": "Marmara",
        "lat": 40.5863,
        "lon": 27.5554
      },
      {
        "name": "Savaştepe",
        "lat": 39.3832,
        "lon": 27.6561
      },
      {
        "name": "Sındırgı",
        "lat": 39.2413,
        "lon": 28.1784
      },
      {
        "name": "Susurluk",
        "lat": 39.9136,
        "lon": 28.1578
      }
    ]
  },
  {
    "id": 11,
    "name": "Bilecik",
    "lat": 40.1451,
    "lon": 29.9799,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.1451,
        "lon": 29.9799
      },
      {
        "name": "Bozüyük",
        "lat": 39.9078,
        "lon": 30.0367
      },
      {
        "name": "Gölpazarı",
        "lat": 40.2847,
        "lon": 30.3172
      },
      {
        "name": "İnhisar",
        "lat": 40.0493,
        "lon": 30.3852
      },
      {
        "name": "Osmaneli",
        "lat": 40.3572,
        "lon": 30.0142
      },
      {
        "name": "Pazaryeri",
        "lat": 39.9939,
        "lon": 29.9042
      },
      {
        "name": "Söğüt",
        "lat": 40.0143,
        "lon": 30.1849
      },
      {
        "name": "Yenipazar",
        "lat": 40.1783,
        "lon": 30.52
      }
    ]
  },
  {
    "id": 12,
    "name": "Bingöl",
    "lat": 38.8854,
    "lon": 40.4983,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.8854,
        "lon": 40.4983
      },
      {
        "name": "Adaklı",
        "lat": 39.2262,
        "lon": 40.4828
      },
      {
        "name": "Genç",
        "lat": 38.7477,
        "lon": 40.5534
      },
      {
        "name": "Karlıova",
        "lat": 39.2904,
        "lon": 41.0059
      },
      {
        "name": "Kiğı",
        "lat": 39.3136,
        "lon": 40.3503
      },
      {
        "name": "Solhan",
        "lat": 38.9652,
        "lon": 41.0544
      },
      {
        "name": "Yayladere",
        "lat": 39.2261,
        "lon": 40.0695
      },
      {
        "name": "Yedisu",
        "lat": 39.4328,
        "lon": 40.5337
      }
    ]
  },
  {
    "id": 13,
    "name": "Bitlis",
    "lat": 38.4006,
    "lon": 42.1095,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.4006,
        "lon": 42.1095
      },
      {
        "name": "Adilcevaz",
        "lat": 38.7991,
        "lon": 42.7316
      },
      {
        "name": "Ahlat",
        "lat": 38.7489,
        "lon": 42.4801
      },
      {
        "name": "Güroymak",
        "lat": 38.5758,
        "lon": 42.0156
      },
      {
        "name": "Hizan",
        "lat": 38.225,
        "lon": 42.4183
      },
      {
        "name": "Mutki",
        "lat": 38.4062,
        "lon": 41.9202
      },
      {
        "name": "Tatvan",
        "lat": 38.4922,
        "lon": 42.2827
      }
    ]
  },
  {
    "id": 14,
    "name": "Bolu",
    "lat": 40.735,
    "lon": 31.6061,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.735,
        "lon": 31.6061
      },
      {
        "name": "Dörtdivan",
        "lat": 40.7205,
        "lon": 32.0631
      },
      {
        "name": "Gerede",
        "lat": 40.8008,
        "lon": 32.1969
      },
      {
        "name": "Göynük",
        "lat": 40.4003,
        "lon": 30.7883
      },
      {
        "name": "Kıbrıscık",
        "lat": 40.4078,
        "lon": 31.8519
      },
      {
        "name": "Mengen",
        "lat": 40.9388,
        "lon": 32.0764
      },
      {
        "name": "Mudurnu",
        "lat": 40.473,
        "lon": 31.2076
      },
      {
        "name": "Seben",
        "lat": 40.4113,
        "lon": 31.5736
      },
      {
        "name": "Yeniçağa",
        "lat": 40.7711,
        "lon": 32.0337
      }
    ]
  },
  {
    "id": 15,
    "name": "Burdur",
    "lat": 37.7203,
    "lon": 30.2908,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.7203,
        "lon": 30.2908
      },
      {
        "name": "Ağlasun",
        "lat": 37.6494,
        "lon": 30.5342
      },
      {
        "name": "Altınyayla",
        "lat": 36.9972,
        "lon": 29.5458
      },
      {
        "name": "Bucak",
        "lat": 37.8693,
        "lon": 39.062
      },
      {
        "name": "Çavdır",
        "lat": 36.3661,
        "lon": 29.3519
      },
      {
        "name": "Çeltikçi",
        "lat": 40.3219,
        "lon": 32.4557
      },
      {
        "name": "Gölhisar",
        "lat": 37.1459,
        "lon": 29.5088
      },
      {
        "name": "Karamanlı",
        "lat": 37.373,
        "lon": 29.8231
      },
      {
        "name": "Kemer",
        "lat": 36.5978,
        "lon": 30.5606
      },
      {
        "name": "Tefenni",
        "lat": 37.3097,
        "lon": 29.7754
      },
      {
        "name": "Yeşilova",
        "lat": 38.1557,
        "lon": 36.2576
      }
    ]
  },
  {
    "id": 16,
    "name": "Bursa",
    "lat": 40.1885,
    "lon": 29.061,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.1885,
        "lon": 29.061
      },
      {
        "name": "Büyükorhan",
        "lat": 39.771,
        "lon": 28.8861
      },
      {
        "name": "Gemlik",
        "lat": 40.4309,
        "lon": 29.1597
      },
      {
        "name": "Gürsu",
        "lat": 40.2188,
        "lon": 29.1949
      },
      {
        "name": "Harmancık",
        "lat": 39.6761,
        "lon": 29.1553
      },
      {
        "name": "İnegöl",
        "lat": 40.0781,
        "lon": 29.5133
      },
      {
        "name": "İznik",
        "lat": 40.4286,
        "lon": 29.7211
      },
      {
        "name": "Karacabey",
        "lat": 40.2132,
        "lon": 28.3612
      },
      {
        "name": "Keles",
        "lat": 39.9136,
        "lon": 29.2294
      },
      {
        "name": "Kestel",
        "lat": 40.1983,
        "lon": 29.2124
      },
      {
        "name": "Mudanya",
        "lat": 40.3752,
        "lon": 28.8838
      },
      {
        "name": "Mustafakemalpaşa",
        "lat": 40.0382,
        "lon": 28.4087
      },
      {
        "name": "Nilüfer",
        "lat": 40.214,
        "lon": 28.9157
      },
      {
        "name": "Orhaneli",
        "lat": 39.9033,
        "lon": 28.9906
      },
      {
        "name": "Orhangazi",
        "lat": 40.4892,
        "lon": 29.3089
      },
      {
        "name": "Osmangazi",
        "lat": 40.1967,
        "lon": 29.0593
      },
      {
        "name": "Yenişehir",
        "lat": 40.5833,
        "lon": 43.0949
      },
      {
        "name": "Yıldırım",
        "lat": 40.1885,
        "lon": 29.1097
      }
    ]
  },
  {
    "id": 17,
    "name": "Çanakkale",
    "lat": 40.1553,
    "lon": 26.4142,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.1553,
        "lon": 26.4142
      },
      {
        "name": "Ayvacık",
        "lat": 40.9911,
        "lon": 36.6314
      },
      {
        "name": "Bayramiç",
        "lat": 39.8086,
        "lon": 26.6098
      },
      {
        "name": "Biga",
        "lat": 40.2281,
        "lon": 27.2422
      },
      {
        "name": "Bozcaada",
        "lat": 39.835,
        "lon": 26.0697
      },
      {
        "name": "Çan",
        "lat": 40.0333,
        "lon": 27.0524
      },
      {
        "name": "Eceabat",
        "lat": 40.1842,
        "lon": 26.3574
      },
      {
        "name": "Ezine",
        "lat": 39.7856,
        "lon": 26.3408
      },
      {
        "name": "Gelibolu",
        "lat": 40.4084,
        "lon": 26.6717
      },
      {
        "name": "Gökçeada",
        "lat": 40.2011,
        "lon": 25.909
      },
      {
        "name": "Lapseki",
        "lat": 40.3442,
        "lon": 26.6856
      },
      {
        "name": "Yenice",
        "lat": 41.1996,
        "lon": 32.3313
      }
    ]
  },
  {
    "id": 18,
    "name": "Çankırı",
    "lat": 40.6013,
    "lon": 33.6134,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.6013,
        "lon": 33.6134
      },
      {
        "name": "Atkaracalar",
        "lat": 40.8159,
        "lon": 33.0756
      },
      {
        "name": "Bayramören",
        "lat": 40.9433,
        "lon": 33.203
      },
      {
        "name": "Çerkeş",
        "lat": 40.8116,
        "lon": 32.8936
      },
      {
        "name": "Eldivan",
        "lat": 40.5297,
        "lon": 33.499
      },
      {
        "name": "Ilgaz",
        "lat": 40.9251,
        "lon": 33.6259
      },
      {
        "name": "Kızılırmak",
        "lat": 40.3456,
        "lon": 33.9864
      },
      {
        "name": "Korgun",
        "lat": 40.7348,
        "lon": 33.5184
      },
      {
        "name": "Kurşunlu",
        "lat": 40.0371,
        "lon": 29.6597
      },
      {
        "name": "Orta",
        "lat": 40.6242,
        "lon": 33.1093
      },
      {
        "name": "Şabanözü",
        "lat": 40.4825,
        "lon": 33.2835
      },
      {
        "name": "Yapraklı",
        "lat": 40.7578,
        "lon": 33.7782
      }
    ]
  },
  {
    "id": 19,
    "name": "Çorum",
    "lat": 40.5506,
    "lon": 34.9556,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.5506,
        "lon": 34.9556
      },
      {
        "name": "Alaca",
        "lat": 40.1683,
        "lon": 34.8425
      },
      {
        "name": "Bayat",
        "lat": 40.6458,
        "lon": 34.2614
      },
      {
        "name": "Boğazkale",
        "lat": 40.0219,
        "lon": 34.6095
      },
      {
        "name": "Dodurga",
        "lat": 40.8549,
        "lon": 34.807
      },
      {
        "name": "İskilip",
        "lat": 40.7353,
        "lon": 34.4739
      },
      {
        "name": "Kargı",
        "lat": 41.1337,
        "lon": 34.4874
      },
      {
        "name": "Laçin",
        "lat": 40.7749,
        "lon": 34.8807
      },
      {
        "name": "Mecitözü",
        "lat": 40.52,
        "lon": 35.2953
      },
      {
        "name": "Oğuzlar",
        "lat": 40.7535,
        "lon": 34.7028
      },
      {
        "name": "Ortaköy",
        "lat": 37.1819,
        "lon": 28.4231
      },
      {
        "name": "Osmancık",
        "lat": 40.9782,
        "lon": 34.8047
      },
      {
        "name": "Sungurlu",
        "lat": 40.1675,
        "lon": 34.3739
      },
      {
        "name": "Uğurludağ",
        "lat": 40.4463,
        "lon": 34.4526
      }
    ]
  },
  {
    "id": 20,
    "name": "Denizli",
    "lat": 37.7765,
    "lon": 29.0864,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.7765,
        "lon": 29.0864
      },
      {
        "name": "Acıpayam",
        "lat": 37.4239,
        "lon": 29.3494
      },
      {
        "name": "Babadağ",
        "lat": 37.8076,
        "lon": 28.8566
      },
      {
        "name": "Baklan",
        "lat": 37.9769,
        "lon": 29.6086
      },
      {
        "name": "Bekilli",
        "lat": 38.2311,
        "lon": 29.4197
      },
      {
        "name": "Beyağaç",
        "lat": 37.2353,
        "lon": 28.8961
      },
      {
        "name": "Bozkurt",
        "lat": 41.9577,
        "lon": 34.0109
      },
      {
        "name": "Buldan",
        "lat": 38.045,
        "lon": 28.8306
      },
      {
        "name": "Çal",
        "lat": 38.0836,
        "lon": 29.3989
      },
      {
        "name": "Çameli",
        "lat": 37.0761,
        "lon": 29.3447
      },
      {
        "name": "Çardak",
        "lat": 37.8269,
        "lon": 29.6683
      },
      {
        "name": "Çivril",
        "lat": 38.3014,
        "lon": 29.7386
      },
      {
        "name": "Güney",
        "lat": 37.4969,
        "lon": 29.555
      },
      {
        "name": "Honaz",
        "lat": 37.7573,
        "lon": 29.27
      },
      {
        "name": "Kale",
        "lat": 40.3869,
        "lon": 39.6833
      },
      {
        "name": "Merkezefendi",
        "lat": 37.8054,
        "lon": 29.0424
      },
      {
        "name": "Pamukkale",
        "lat": 37.7912,
        "lon": 29.1014
      },
      {
        "name": "Sarayköy",
        "lat": 37.9245,
        "lon": 28.9252
      },
      {
        "name": "Serinhisar",
        "lat": 37.581,
        "lon": 29.2664
      },
      {
        "name": "Tavas",
        "lat": 37.5735,
        "lon": 29.0706
      }
    ]
  },
  {
    "id": 21,
    "name": "Diyarbakır",
    "lat": 37.9144,
    "lon": 40.2306,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.9144,
        "lon": 40.2306
      },
      {
        "name": "Bağlar",
        "lat": 39.3446,
        "lon": 42.0817
      },
      {
        "name": "Bismil",
        "lat": 37.8451,
        "lon": 40.6593
      },
      {
        "name": "Çermik",
        "lat": 38.1354,
        "lon": 39.445
      },
      {
        "name": "Çınar",
        "lat": 37.7223,
        "lon": 40.407
      },
      {
        "name": "Çüngüş",
        "lat": 38.208,
        "lon": 39.2855
      },
      {
        "name": "Dicle",
        "lat": 37.2887,
        "lon": 42.0672
      },
      {
        "name": "Eğil",
        "lat": 38.2575,
        "lon": 40.0744
      },
      {
        "name": "Ergani",
        "lat": 38.269,
        "lon": 39.7545
      },
      {
        "name": "Hani",
        "lat": 38.4074,
        "lon": 40.3858
      },
      {
        "name": "Hazro",
        "lat": 38.249,
        "lon": 40.7713
      },
      {
        "name": "Kayapınar",
        "lat": 37.5576,
        "lon": 41.1623
      },
      {
        "name": "Kocaköy",
        "lat": 40.2893,
        "lon": 43.4609
      },
      {
        "name": "Kulp",
        "lat": 38.4975,
        "lon": 41.0067
      },
      {
        "name": "Lice",
        "lat": 38.4582,
        "lon": 40.6389
      },
      {
        "name": "Silvan",
        "lat": 38.1371,
        "lon": 41.0082
      },
      {
        "name": "Sur",
        "lat": 37.9135,
        "lon": 40.2286
      },
      {
        "name": "Yenişehir",
        "lat": 40.5833,
        "lon": 43.0949
      }
    ]
  },
  {
    "id": 22,
    "name": "Edirne",
    "lat": 41.6818,
    "lon": 26.5623,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.6818,
        "lon": 26.5623
      },
      {
        "name": "Enez",
        "lat": 40.7247,
        "lon": 26.0825
      },
      {
        "name": "Havsa",
        "lat": 41.549,
        "lon": 26.8221
      },
      {
        "name": "İpsala",
        "lat": 40.9211,
        "lon": 26.3827
      },
      {
        "name": "Keşan",
        "lat": 40.8552,
        "lon": 26.6327
      },
      {
        "name": "Lalapaşa",
        "lat": 41.8395,
        "lon": 26.7356
      },
      {
        "name": "Meriç",
        "lat": 41.1918,
        "lon": 26.421
      },
      {
        "name": "Süloğlu",
        "lat": 41.769,
        "lon": 26.91
      },
      {
        "name": "Uzunköprü",
        "lat": 41.2691,
        "lon": 26.686
      }
    ]
  },
  {
    "id": 23,
    "name": "Elazığ",
    "lat": 38.681,
    "lon": 39.2264,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.681,
        "lon": 39.2264
      },
      {
        "name": "Ağın",
        "lat": 38.9438,
        "lon": 38.715
      },
      {
        "name": "Alacakaya",
        "lat": 38.462,
        "lon": 39.8623
      },
      {
        "name": "Arıcak",
        "lat": 38.5634,
        "lon": 40.1248
      },
      {
        "name": "Baskil",
        "lat": 38.5687,
        "lon": 38.8163
      },
      {
        "name": "Karakoçan",
        "lat": 38.9518,
        "lon": 40.0271
      },
      {
        "name": "Keban",
        "lat": 38.7938,
        "lon": 38.7352
      },
      {
        "name": "Kovancılar",
        "lat": 38.7188,
        "lon": 39.8627
      },
      {
        "name": "Maden",
        "lat": 38.3867,
        "lon": 39.6641
      },
      {
        "name": "Palu",
        "lat": 38.6913,
        "lon": 39.9198
      },
      {
        "name": "Sivrice",
        "lat": 37.277,
        "lon": 41.3359
      }
    ]
  },
  {
    "id": 24,
    "name": "Erzincan",
    "lat": 39.75,
    "lon": 39.5,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.75,
        "lon": 39.5
      },
      {
        "name": "Çayırlı",
        "lat": 39.8077,
        "lon": 40.028
      },
      {
        "name": "İliç",
        "lat": 39.4565,
        "lon": 38.5647
      },
      {
        "name": "Kemah",
        "lat": 39.5961,
        "lon": 39.0233
      },
      {
        "name": "Kemaliye",
        "lat": 39.2629,
        "lon": 38.4967
      },
      {
        "name": "Otlukbeli",
        "lat": 39.97,
        "lon": 40.0187
      },
      {
        "name": "Refahiye",
        "lat": 39.8931,
        "lon": 38.7661
      },
      {
        "name": "Tercan",
        "lat": 39.7771,
        "lon": 40.3778
      },
      {
        "name": "Üzümlü",
        "lat": 37.5406,
        "lon": 31.6038
      }
    ]
  },
  {
    "id": 25,
    "name": "Erzurum",
    "lat": 39.9043,
    "lon": 41.2679,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.9043,
        "lon": 41.2679
      },
      {
        "name": "Aşkale",
        "lat": 39.9208,
        "lon": 40.695
      },
      {
        "name": "Aziziye",
        "lat": 39.9043,
        "lon": 41.2679
      },
      {
        "name": "Çat",
        "lat": 39.614,
        "lon": 40.9782
      },
      {
        "name": "Hınıs",
        "lat": 39.3577,
        "lon": 41.6925
      },
      {
        "name": "Horasan",
        "lat": 40.0388,
        "lon": 42.1637
      },
      {
        "name": "İspir",
        "lat": 40.4798,
        "lon": 40.9937
      },
      {
        "name": "Karaçoban",
        "lat": 39.3436,
        "lon": 42.0992
      },
      {
        "name": "Karayazı",
        "lat": 39.696,
        "lon": 42.1428
      },
      {
        "name": "Köprüköy",
        "lat": 39.966,
        "lon": 41.8684
      },
      {
        "name": "Narman",
        "lat": 40.3445,
        "lon": 41.8609
      },
      {
        "name": "Oltu",
        "lat": 40.5395,
        "lon": 41.9872
      },
      {
        "name": "Olur",
        "lat": 40.8216,
        "lon": 42.1305
      },
      {
        "name": "Palandöken",
        "lat": 39.889,
        "lon": 41.2805
      },
      {
        "name": "Pasinler",
        "lat": 39.9798,
        "lon": 41.67
      },
      {
        "name": "Pazaryolu",
        "lat": 40.4114,
        "lon": 40.7678
      },
      {
        "name": "Şenkaya",
        "lat": 40.5565,
        "lon": 42.3427
      },
      {
        "name": "Tekman",
        "lat": 39.6411,
        "lon": 41.5054
      },
      {
        "name": "Tortum",
        "lat": 40.2889,
        "lon": 41.541
      },
      {
        "name": "Uzundere",
        "lat": 40.5322,
        "lon": 41.5383
      },
      {
        "name": "Yakutiye",
        "lat": 39.8982,
        "lon": 41.2692
      }
    ]
  },
  {
    "id": 26,
    "name": "Eskişehir",
    "lat": 39.7767,
    "lon": 30.5206,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.7767,
        "lon": 30.5206
      },
      {
        "name": "Alpu",
        "lat": 39.769,
        "lon": 30.9606
      },
      {
        "name": "Beylikova",
        "lat": 39.6869,
        "lon": 31.2056
      },
      {
        "name": "Çifteler",
        "lat": 39.3831,
        "lon": 31.0392
      },
      {
        "name": "Günyüzü",
        "lat": 39.3835,
        "lon": 31.81
      },
      {
        "name": "Han",
        "lat": 39.1592,
        "lon": 30.8614
      },
      {
        "name": "İnönü",
        "lat": 39.2328,
        "lon": 42.8639
      },
      {
        "name": "Mahmudiye",
        "lat": 39.4978,
        "lon": 30.9872
      },
      {
        "name": "Mihalgazi",
        "lat": 40.0262,
        "lon": 30.5771
      },
      {
        "name": "Mihalıççık",
        "lat": 39.8659,
        "lon": 31.4957
      },
      {
        "name": "Odunpazarı",
        "lat": 39.7682,
        "lon": 30.5354
      },
      {
        "name": "Sarıcakaya",
        "lat": 40.0369,
        "lon": 30.6268
      },
      {
        "name": "Seyitgazi",
        "lat": 39.4447,
        "lon": 30.6947
      },
      {
        "name": "Sivrihisar",
        "lat": 39.4504,
        "lon": 31.5341
      },
      {
        "name": "Tepebaşı",
        "lat": 39.8109,
        "lon": 30.5255
      }
    ]
  },
  {
    "id": 27,
    "name": "Gaziantep",
    "lat": 37.0662,
    "lon": 37.3833,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.0662,
        "lon": 37.3833
      },
      {
        "name": "Araban",
        "lat": 37.4267,
        "lon": 37.689
      },
      {
        "name": "İslahiye",
        "lat": 37.025,
        "lon": 36.6306
      },
      {
        "name": "Karkamış",
        "lat": 36.8345,
        "lon": 37.9983
      },
      {
        "name": "Nizip",
        "lat": 37.0097,
        "lon": 37.7942
      },
      {
        "name": "Nurdağı",
        "lat": 37.1682,
        "lon": 36.7362
      },
      {
        "name": "Oğuzeli",
        "lat": 36.9657,
        "lon": 37.5134
      },
      {
        "name": "Şahinbey",
        "lat": 37.0484,
        "lon": 37.3437
      },
      {
        "name": "Şehitkamil",
        "lat": 37.0796,
        "lon": 37.38
      },
      {
        "name": "Yavuzeli",
        "lat": 37.3177,
        "lon": 37.5682
      }
    ]
  },
  {
    "id": 28,
    "name": "Giresun",
    "lat": 40.9128,
    "lon": 38.3895,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.9128,
        "lon": 38.3895
      },
      {
        "name": "Alucra",
        "lat": 40.3202,
        "lon": 38.7641
      },
      {
        "name": "Bulancak",
        "lat": 40.938,
        "lon": 38.2315
      },
      {
        "name": "Çamoluk",
        "lat": 40.1273,
        "lon": 38.7301
      },
      {
        "name": "Çanakçı",
        "lat": 40.9114,
        "lon": 38.9881
      },
      {
        "name": "Dereli",
        "lat": 40.7389,
        "lon": 38.4434
      },
      {
        "name": "Doğankent",
        "lat": 40.8075,
        "lon": 38.9172
      },
      {
        "name": "Espiye",
        "lat": 40.947,
        "lon": 38.703
      },
      {
        "name": "Eynesil",
        "lat": 41.0644,
        "lon": 39.1427
      },
      {
        "name": "Görele",
        "lat": 41.0308,
        "lon": 39.0031
      },
      {
        "name": "Güce",
        "lat": 40.8932,
        "lon": 38.7982
      },
      {
        "name": "Keşap",
        "lat": 40.9103,
        "lon": 38.5013
      },
      {
        "name": "Piraziz",
        "lat": 40.9224,
        "lon": 38.1246
      },
      {
        "name": "Şebinkarahisar",
        "lat": 40.9128,
        "lon": 38.3895
      },
      {
        "name": "Tirebolu",
        "lat": 41.0069,
        "lon": 38.8139
      },
      {
        "name": "Yağlıdere",
        "lat": 40.5443,
        "lon": 39.5276
      }
    ]
  },
  {
    "id": 29,
    "name": "Gümüşhane",
    "lat": 40.46,
    "lon": 39.4814,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.46,
        "lon": 39.4814
      },
      {
        "name": "Kelkit",
        "lat": 40.1268,
        "lon": 39.4342
      },
      {
        "name": "Köse",
        "lat": 40.2069,
        "lon": 39.6463
      },
      {
        "name": "Kürtün",
        "lat": 40.6952,
        "lon": 39.0947
      },
      {
        "name": "Şiran",
        "lat": 40.1906,
        "lon": 39.1175
      },
      {
        "name": "Torul",
        "lat": 40.5507,
        "lon": 39.2834
      }
    ]
  },
  {
    "id": 30,
    "name": "Hakkâri",
    "lat": 37.5833,
    "lon": 43.7333,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.5833,
        "lon": 43.7333
      },
      {
        "name": "Çukurca",
        "lat": 37.2481,
        "lon": 43.6136
      },
      {
        "name": "Şemdinli",
        "lat": 37.3051,
        "lon": 44.5742
      },
      {
        "name": "Yüksekova",
        "lat": 37.5736,
        "lon": 44.2872
      }
    ]
  },
  {
    "id": 31,
    "name": "Hatay",
    "lat": 36.4018,
    "lon": 36.3498,
    "districts": [
      {
        "name": "Merkez",
        "lat": 36.4018,
        "lon": 36.3498
      },
      {
        "name": "Altınözü",
        "lat": 36.1155,
        "lon": 36.2483
      },
      {
        "name": "Antakya",
        "lat": 36.2066,
        "lon": 36.1572
      },
      {
        "name": "Arsuz",
        "lat": 36.413,
        "lon": 35.8903
      },
      {
        "name": "Belen",
        "lat": 36.4887,
        "lon": 36.1949
      },
      {
        "name": "Defne",
        "lat": 36.4018,
        "lon": 36.3498
      },
      {
        "name": "Dörtyol",
        "lat": 36.8392,
        "lon": 36.2302
      },
      {
        "name": "Erzin",
        "lat": 36.9535,
        "lon": 36.1984
      },
      {
        "name": "Hassa",
        "lat": 36.7994,
        "lon": 36.5178
      },
      {
        "name": "İskenderun",
        "lat": 36.5872,
        "lon": 36.1735
      },
      {
        "name": "Kırıkhan",
        "lat": 36.4994,
        "lon": 36.3576
      },
      {
        "name": "Kumlu",
        "lat": 36.3635,
        "lon": 36.455
      },
      {
        "name": "Payas",
        "lat": 36.756,
        "lon": 36.2143
      },
      {
        "name": "Reyhanlı",
        "lat": 36.2679,
        "lon": 36.5675
      },
      {
        "name": "Samandağ",
        "lat": 36.0801,
        "lon": 35.976
      },
      {
        "name": "Yayladağı",
        "lat": 35.9025,
        "lon": 36.0627
      }
    ]
  },
  {
    "id": 32,
    "name": "Isparta",
    "lat": 37.7648,
    "lon": 30.5566,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.7648,
        "lon": 30.5566
      },
      {
        "name": "Aksu",
        "lat": 40.0896,
        "lon": 38.0347
      },
      {
        "name": "Atabey",
        "lat": 37.9508,
        "lon": 30.6386
      },
      {
        "name": "Eğirdir",
        "lat": 37.8746,
        "lon": 30.8504
      },
      {
        "name": "Gelendost",
        "lat": 38.1208,
        "lon": 31.0153
      },
      {
        "name": "Gönen",
        "lat": 40.1049,
        "lon": 27.654
      },
      {
        "name": "Keçiborlu",
        "lat": 37.9425,
        "lon": 30.3022
      },
      {
        "name": "Senirkent",
        "lat": 38.1044,
        "lon": 30.5486
      },
      {
        "name": "Sütçüler",
        "lat": 37.4974,
        "lon": 30.9773
      },
      {
        "name": "Şarkikaraağaç",
        "lat": 38.0794,
        "lon": 31.3664
      },
      {
        "name": "Uluborlu",
        "lat": 38.0782,
        "lon": 30.4502
      },
      {
        "name": "Yalvaç",
        "lat": 38.2956,
        "lon": 31.1778
      },
      {
        "name": "Yenişarbademli",
        "lat": 37.7078,
        "lon": 31.3864
      }
    ]
  },
  {
    "id": 33,
    "name": "Mersin",
    "lat": 36.8121,
    "lon": 34.6415,
    "districts": [
      {
        "name": "Merkez",
        "lat": 36.8121,
        "lon": 34.6415
      },
      {
        "name": "Akdeniz",
        "lat": 36.8121,
        "lon": 34.6415
      },
      {
        "name": "Anamur",
        "lat": 36.0751,
        "lon": 32.8369
      },
      {
        "name": "Aydıncık",
        "lat": 40.1273,
        "lon": 35.2876
      },
      {
        "name": "Bozyazı",
        "lat": 36.1082,
        "lon": 32.9611
      },
      {
        "name": "Çamlıyayla",
        "lat": 37.1665,
        "lon": 34.593
      },
      {
        "name": "Erdemli",
        "lat": 36.605,
        "lon": 34.3084
      },
      {
        "name": "Gülnar",
        "lat": 36.3415,
        "lon": 33.3992
      },
      {
        "name": "Mezitli",
        "lat": 36.7454,
        "lon": 34.5226
      },
      {
        "name": "Mut",
        "lat": 36.6439,
        "lon": 33.4389
      },
      {
        "name": "Silifke",
        "lat": 36.3778,
        "lon": 33.9344
      },
      {
        "name": "Tarsus",
        "lat": 36.9177,
        "lon": 34.8928
      },
      {
        "name": "Toroslar",
        "lat": 36.8121,
        "lon": 34.6415
      },
      {
        "name": "Yenişehir",
        "lat": 40.5833,
        "lon": 43.0949
      }
    ]
  },
  {
    "id": 34,
    "name": "İstanbul",
    "lat": 41.0082,
    "lon": 28.9784,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.0082,
        "lon": 28.9784
      },
      {
        "name": "Adalar",
        "lat": 40.8678,
        "lon": 29.1331
      },
      {
        "name": "Arnavutköy",
        "lat": 41.0683,
        "lon": 29.0434
      },
      {
        "name": "Ataşehir",
        "lat": 38.4885,
        "lon": 27.0613
      },
      {
        "name": "Avcılar",
        "lat": 41.0082,
        "lon": 28.9784
      },
      {
        "name": "Bağcılar",
        "lat": 41.039,
        "lon": 28.8567
      },
      {
        "name": "Bahçelievler",
        "lat": 39.7263,
        "lon": 43.0506
      },
      {
        "name": "Bakırköy",
        "lat": 41.0082,
        "lon": 28.9784
      },
      {
        "name": "Başakşehir",
        "lat": 41.106,
        "lon": 28.791
      },
      {
        "name": "Bayrampaşa",
        "lat": 40.6142,
        "lon": 43.1004
      },
      {
        "name": "Beşiktaş",
        "lat": 41.0082,
        "lon": 28.9784
      },
      {
        "name": "Beykoz",
        "lat": 41.0082,
        "lon": 28.9784
      },
      {
        "name": "Beylikdüzü",
        "lat": 40.982,
        "lon": 28.6399
      },
      {
        "name": "Beyoğlu",
        "lat": 41.0082,
        "lon": 28.9784
      },
      {
        "name": "Büyükçekmece",
        "lat": 41.0207,
        "lon": 28.585
      },
      {
        "name": "Çatalca",
        "lat": 41.1407,
        "lon": 28.4597
      },
      {
        "name": "Çekmeköy",
        "lat": 41.0412,
        "lon": 29.1784
      },
      {
        "name": "Esenler",
        "lat": 41.0435,
        "lon": 28.8762
      },
      {
        "name": "Esenyurt",
        "lat": 41.027,
        "lon": 28.6773
      },
      {
        "name": "Eyüp",
        "lat": 41.0082,
        "lon": 28.9784
      },
      {
        "name": "Fatih",
        "lat": 39.7307,
        "lon": 43.0498
      },
      {
        "name": "Gaziosmanpaşa",
        "lat": 39.8962,
        "lon": 32.8665
      },
      {
        "name": "Güngören",
        "lat": 41.0082,
        "lon": 28.9784
      },
      {
        "name": "Kadıköy",
        "lat": 41.1366,
        "lon": 28.3642
      },
      {
        "name": "Kağıthane",
        "lat": 41.0082,
        "lon": 28.9784
      },
      {
        "name": "Kartal",
        "lat": 37.1063,
        "lon": 36.9801
      },
      {
        "name": "Küçükçekmece",
        "lat": 40.991,
        "lon": 28.7712
      },
      {
        "name": "Maltepe",
        "lat": 38.492,
        "lon": 27.075
      },
      {
        "name": "Pendik",
        "lat": 40.8775,
        "lon": 29.2725
      },
      {
        "name": "Sancaktepe",
        "lat": 41.0024,
        "lon": 29.2319
      },
      {
        "name": "Sarıyer",
        "lat": 40.7725,
        "lon": 31.3102
      },
      {
        "name": "Silivri",
        "lat": 41.0739,
        "lon": 28.2464
      },
      {
        "name": "Sultanbeyli",
        "lat": 40.9607,
        "lon": 29.2707
      },
      {
        "name": "Sultangazi",
        "lat": 41.1065,
        "lon": 28.8685
      },
      {
        "name": "Şile",
        "lat": 41.1789,
        "lon": 29.6108
      },
      {
        "name": "Şişli",
        "lat": 41.0605,
        "lon": 28.9872
      },
      {
        "name": "Tuzla",
        "lat": 36.7007,
        "lon": 35.0873
      },
      {
        "name": "Ümraniye",
        "lat": 41.0329,
        "lon": 29.1014
      },
      {
        "name": "Üsküdar",
        "lat": 41.0227,
        "lon": 29.0137
      },
      {
        "name": "Zeytinburnu",
        "lat": 40.9944,
        "lon": 28.9042
      }
    ]
  },
  {
    "id": 35,
    "name": "İzmir",
    "lat": 38.4237,
    "lon": 27.1428,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.4237,
        "lon": 27.1428
      },
      {
        "name": "Aliağa",
        "lat": 38.7998,
        "lon": 26.972
      },
      {
        "name": "Balçova",
        "lat": 38.4237,
        "lon": 27.1428
      },
      {
        "name": "Bayındır",
        "lat": 38.2174,
        "lon": 27.6474
      },
      {
        "name": "Bayraklı",
        "lat": 38.4672,
        "lon": 27.1638
      },
      {
        "name": "Bergama",
        "lat": 39.1207,
        "lon": 27.1805
      },
      {
        "name": "Beydağ",
        "lat": 38.4237,
        "lon": 27.1428
      },
      {
        "name": "Bornova",
        "lat": 38.4792,
        "lon": 27.2399
      },
      {
        "name": "Buca",
        "lat": 38.3983,
        "lon": 27.1666
      },
      {
        "name": "Çeşme",
        "lat": 38.3261,
        "lon": 26.3057
      },
      {
        "name": "Çiğli",
        "lat": 38.4965,
        "lon": 27.0703
      },
      {
        "name": "Dikili",
        "lat": 39.071,
        "lon": 26.8902
      },
      {
        "name": "Foça",
        "lat": 38.6703,
        "lon": 26.7566
      },
      {
        "name": "Gaziemir",
        "lat": 38.3239,
        "lon": 27.1292
      },
      {
        "name": "Güzelbahçe",
        "lat": 38.4237,
        "lon": 27.1428
      },
      {
        "name": "Karabağlar",
        "lat": 38.382,
        "lon": 27.132
      },
      {
        "name": "Karaburun",
        "lat": 38.6364,
        "lon": 26.5109
      },
      {
        "name": "Karşıyaka",
        "lat": 39.5334,
        "lon": 42.7711
      },
      {
        "name": "Kemalpaşa",
        "lat": 41.4834,
        "lon": 41.5275
      },
      {
        "name": "Kınık",
        "lat": 39.0872,
        "lon": 27.3833
      },
      {
        "name": "Kiraz",
        "lat": 38.2306,
        "lon": 28.2044
      },
      {
        "name": "Konak",
        "lat": 38.4,
        "lon": 27.1
      },
      {
        "name": "Menderes",
        "lat": 38.2496,
        "lon": 27.1343
      },
      {
        "name": "Menemen",
        "lat": 38.6075,
        "lon": 27.0694
      },
      {
        "name": "Narlıdere",
        "lat": 38.2268,
        "lon": 41.8901
      },
      {
        "name": "Ödemiş",
        "lat": 38.2278,
        "lon": 27.9696
      },
      {
        "name": "Seferihisar",
        "lat": 38.1975,
        "lon": 26.8388
      },
      {
        "name": "Selçuk",
        "lat": 37.9514,
        "lon": 27.3685
      },
      {
        "name": "Tire",
        "lat": 38.0888,
        "lon": 27.7351
      },
      {
        "name": "Torbalı",
        "lat": 38.182,
        "lon": 27.335
      },
      {
        "name": "Urla",
        "lat": 38.3229,
        "lon": 26.764
      }
    ]
  },
  {
    "id": 36,
    "name": "Kars",
    "lat": 40.6013,
    "lon": 43.0975,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.6013,
        "lon": 43.0975
      },
      {
        "name": "Akyaka",
        "lat": 40.7409,
        "lon": 43.6143
      },
      {
        "name": "Arpaçay",
        "lat": 40.8452,
        "lon": 43.3275
      },
      {
        "name": "Digor",
        "lat": 40.369,
        "lon": 43.41
      },
      {
        "name": "Kağızman",
        "lat": 40.1567,
        "lon": 43.1342
      },
      {
        "name": "Sarıkamış",
        "lat": 40.3277,
        "lon": 42.587
      },
      {
        "name": "Selim",
        "lat": 40.4577,
        "lon": 42.7829
      },
      {
        "name": "Susuz",
        "lat": 40.7791,
        "lon": 43.1277
      }
    ]
  },
  {
    "id": 37,
    "name": "Kastamonu",
    "lat": 41.3887,
    "lon": 33.7827,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.3887,
        "lon": 33.7827
      },
      {
        "name": "Abana",
        "lat": 41.9786,
        "lon": 34.011
      },
      {
        "name": "Ağlı",
        "lat": 41.686,
        "lon": 33.5538
      },
      {
        "name": "Araç",
        "lat": 41.2422,
        "lon": 33.3277
      },
      {
        "name": "Azdavay",
        "lat": 41.6427,
        "lon": 33.3
      },
      {
        "name": "Bozkurt",
        "lat": 41.9577,
        "lon": 34.0109
      },
      {
        "name": "Cide",
        "lat": 41.8921,
        "lon": 33.0044
      },
      {
        "name": "Çatalzeytin",
        "lat": 41.9531,
        "lon": 34.2163
      },
      {
        "name": "Daday",
        "lat": 41.4787,
        "lon": 33.4667
      },
      {
        "name": "Devrekani",
        "lat": 41.603,
        "lon": 33.8392
      },
      {
        "name": "Doğanyurt",
        "lat": 40.6881,
        "lon": 36.7164
      },
      {
        "name": "Hanönü",
        "lat": 41.627,
        "lon": 34.4667
      },
      {
        "name": "İhsangazi",
        "lat": 41.2043,
        "lon": 33.5545
      },
      {
        "name": "İnebolu",
        "lat": 41.9789,
        "lon": 33.7601
      },
      {
        "name": "Küre",
        "lat": 41.2835,
        "lon": 41.5626
      },
      {
        "name": "Pınarbaşı",
        "lat": 38.4906,
        "lon": 42.2767
      },
      {
        "name": "Seydiler",
        "lat": 41.62,
        "lon": 33.7182
      },
      {
        "name": "Şenpazar",
        "lat": 41.8089,
        "lon": 33.2313
      },
      {
        "name": "Taşköprü",
        "lat": 40.6736,
        "lon": 29.3911
      },
      {
        "name": "Tosya",
        "lat": 41.0155,
        "lon": 34.0401
      }
    ]
  },
  {
    "id": 38,
    "name": "Kayseri",
    "lat": 38.7312,
    "lon": 35.4787,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.7312,
        "lon": 35.4787
      },
      {
        "name": "Akkışla",
        "lat": 39.0022,
        "lon": 36.1738
      },
      {
        "name": "Bünyan",
        "lat": 38.8463,
        "lon": 35.8603
      },
      {
        "name": "Develi",
        "lat": 38.3906,
        "lon": 35.4922
      },
      {
        "name": "Felahiye",
        "lat": 39.0906,
        "lon": 35.5672
      },
      {
        "name": "Hacılar",
        "lat": 41.4911,
        "lon": 32.093
      },
      {
        "name": "İncesu",
        "lat": 37.219,
        "lon": 37.2898
      },
      {
        "name": "Kocasinan",
        "lat": 38.7497,
        "lon": 35.4714
      },
      {
        "name": "Melikgazi",
        "lat": 38.7193,
        "lon": 35.453
      },
      {
        "name": "Özvatan",
        "lat": 39.1069,
        "lon": 35.6999
      },
      {
        "name": "Pınarbaşı",
        "lat": 38.4906,
        "lon": 42.2767
      },
      {
        "name": "Sarıoğlan",
        "lat": 39.0769,
        "lon": 35.9667
      },
      {
        "name": "Sarız",
        "lat": 38.4792,
        "lon": 36.499
      },
      {
        "name": "Talas",
        "lat": 38.6908,
        "lon": 35.5538
      },
      {
        "name": "Tomarza",
        "lat": 38.4472,
        "lon": 35.7992
      },
      {
        "name": "Yahyalı",
        "lat": 38.1023,
        "lon": 35.357
      },
      {
        "name": "Yeşilhisar",
        "lat": 38.6744,
        "lon": 29.9406
      }
    ]
  },
  {
    "id": 39,
    "name": "Kırklareli",
    "lat": 41.7333,
    "lon": 27.2167,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.7333,
        "lon": 27.2167
      },
      {
        "name": "Babaeski",
        "lat": 41.4281,
        "lon": 27.0966
      },
      {
        "name": "Demirköy",
        "lat": 41.7333,
        "lon": 27.2167
      },
      {
        "name": "Kofçaz",
        "lat": 41.9448,
        "lon": 27.1583
      },
      {
        "name": "Lüleburgaz",
        "lat": 41.4017,
        "lon": 27.3575
      },
      {
        "name": "Pehlivanköy",
        "lat": 41.3481,
        "lon": 26.9252
      },
      {
        "name": "Pınarhisar",
        "lat": 41.6271,
        "lon": 27.5148
      },
      {
        "name": "Vize",
        "lat": 41.5763,
        "lon": 27.7673
      }
    ]
  },
  {
    "id": 40,
    "name": "Kırşehir",
    "lat": 39.1425,
    "lon": 34.1709,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.1425,
        "lon": 34.1709
      },
      {
        "name": "Akçakent",
        "lat": 39.6228,
        "lon": 34.0958
      },
      {
        "name": "Akpınar",
        "lat": 41.2806,
        "lon": 28.8073
      },
      {
        "name": "Boztepe",
        "lat": 40.1878,
        "lon": 35.8875
      },
      {
        "name": "Çiçekdağı",
        "lat": 39.6069,
        "lon": 34.4086
      },
      {
        "name": "Kaman",
        "lat": 39.3575,
        "lon": 33.7239
      },
      {
        "name": "Mucur",
        "lat": 39.0615,
        "lon": 34.3829
      }
    ]
  },
  {
    "id": 41,
    "name": "Kocaeli",
    "lat": 40.8533,
    "lon": 29.8815,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.8533,
        "lon": 29.8815
      },
      {
        "name": "Başiskele",
        "lat": 40.8533,
        "lon": 29.8815
      },
      {
        "name": "Çayırova",
        "lat": 40.8344,
        "lon": 29.4
      },
      {
        "name": "Darıca",
        "lat": 40.0206,
        "lon": 27.8637
      },
      {
        "name": "Derince",
        "lat": 40.7569,
        "lon": 29.8147
      },
      {
        "name": "Dilovası",
        "lat": 40.8533,
        "lon": 29.8815
      },
      {
        "name": "Gebze",
        "lat": 40.8028,
        "lon": 29.4307
      },
      {
        "name": "Gölcük",
        "lat": 40.715,
        "lon": 29.8182
      },
      {
        "name": "İzmit",
        "lat": 40.765,
        "lon": 29.9293
      },
      {
        "name": "Kandıra",
        "lat": 41.07,
        "lon": 30.1526
      },
      {
        "name": "Karamürsel",
        "lat": 40.6913,
        "lon": 29.6165
      },
      {
        "name": "Kartepe",
        "lat": 40.7522,
        "lon": 30.0235
      },
      {
        "name": "Körfez",
        "lat": 38.4881,
        "lon": 27.1377
      }
    ]
  },
  {
    "id": 42,
    "name": "Konya",
    "lat": 37.8746,
    "lon": 32.4932,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.8746,
        "lon": 32.4932
      },
      {
        "name": "Ahırlı",
        "lat": 37.2387,
        "lon": 32.1188
      },
      {
        "name": "Akören",
        "lat": 41.1968,
        "lon": 28.3337
      },
      {
        "name": "Akşehir",
        "lat": 38.3575,
        "lon": 31.4164
      },
      {
        "name": "Altınekin",
        "lat": 38.3078,
        "lon": 32.8686
      },
      {
        "name": "Beyşehir",
        "lat": 37.6773,
        "lon": 31.7246
      },
      {
        "name": "Bozkır",
        "lat": 37.1896,
        "lon": 32.2474
      },
      {
        "name": "Cihanbeyli",
        "lat": 38.6607,
        "lon": 32.9244
      },
      {
        "name": "Çeltik",
        "lat": 39.0244,
        "lon": 31.7906
      },
      {
        "name": "Çumra",
        "lat": 37.5732,
        "lon": 32.7745
      },
      {
        "name": "Derbent",
        "lat": 38.0142,
        "lon": 32.0164
      },
      {
        "name": "Derebucak",
        "lat": 37.3918,
        "lon": 31.5092
      },
      {
        "name": "Doğanhisar",
        "lat": 38.1463,
        "lon": 31.6765
      },
      {
        "name": "Emirgazi",
        "lat": 37.9022,
        "lon": 33.8372
      },
      {
        "name": "Ereğli",
        "lat": 41.2826,
        "lon": 31.4181
      },
      {
        "name": "Güneysınır",
        "lat": 37.2694,
        "lon": 32.729
      },
      {
        "name": "Hadim",
        "lat": 36.9878,
        "lon": 32.4567
      },
      {
        "name": "Halkapınar",
        "lat": 37.4339,
        "lon": 34.1874
      },
      {
        "name": "Hüyük",
        "lat": 37.9539,
        "lon": 31.5964
      },
      {
        "name": "Ilgın",
        "lat": 38.2792,
        "lon": 31.9139
      },
      {
        "name": "Kadınhanı",
        "lat": 38.2397,
        "lon": 32.2114
      },
      {
        "name": "Karapınar",
        "lat": 37.7609,
        "lon": 38.2572
      },
      {
        "name": "Karatay",
        "lat": 37.8673,
        "lon": 32.5286
      },
      {
        "name": "Kulu",
        "lat": 39.0951,
        "lon": 33.0799
      },
      {
        "name": "Meram",
        "lat": 37.8299,
        "lon": 32.4678
      },
      {
        "name": "Sarayönü",
        "lat": 38.262,
        "lon": 32.4046
      },
      {
        "name": "Selçuklu",
        "lat": 37.8842,
        "lon": 32.4922
      },
      {
        "name": "Seydişehir",
        "lat": 37.4193,
        "lon": 31.8453
      },
      {
        "name": "Taşkent",
        "lat": 36.9243,
        "lon": 32.4913
      },
      {
        "name": "Tuzlukçu",
        "lat": 38.4778,
        "lon": 31.6264
      },
      {
        "name": "Yalıhüyük",
        "lat": 37.3008,
        "lon": 32.0855
      },
      {
        "name": "Yunak",
        "lat": 38.8142,
        "lon": 31.7322
      }
    ]
  },
  {
    "id": 43,
    "name": "Kütahya",
    "lat": 39.4167,
    "lon": 29.9833,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.4167,
        "lon": 29.9833
      },
      {
        "name": "Altıntaş",
        "lat": 39.0597,
        "lon": 30.1092
      },
      {
        "name": "Aslanapa",
        "lat": 39.2158,
        "lon": 29.8699
      },
      {
        "name": "Çavdarhisar",
        "lat": 39.1934,
        "lon": 29.6192
      },
      {
        "name": "Domaniç",
        "lat": 39.8019,
        "lon": 29.6092
      },
      {
        "name": "Dumlupınar",
        "lat": 40.123,
        "lon": 32.9435
      },
      {
        "name": "Emet",
        "lat": 39.343,
        "lon": 29.2585
      },
      {
        "name": "Gediz",
        "lat": 38.9939,
        "lon": 29.3913
      },
      {
        "name": "Hisarcık",
        "lat": 39.2506,
        "lon": 29.2312
      },
      {
        "name": "Pazarlar",
        "lat": 38.995,
        "lon": 29.1258
      },
      {
        "name": "Simav",
        "lat": 39.0882,
        "lon": 28.9777
      },
      {
        "name": "Şaphane",
        "lat": 39.0273,
        "lon": 29.2222
      },
      {
        "name": "Tavşanlı",
        "lat": 40.8188,
        "lon": 29.5114
      }
    ]
  },
  {
    "id": 44,
    "name": "Malatya",
    "lat": 38.3552,
    "lon": 38.3095,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.3552,
        "lon": 38.3095
      },
      {
        "name": "Akçadağ",
        "lat": 38.339,
        "lon": 37.9702
      },
      {
        "name": "Arapgir",
        "lat": 39.0412,
        "lon": 38.4952
      },
      {
        "name": "Arguvan",
        "lat": 38.7737,
        "lon": 38.2633
      },
      {
        "name": "Battalgazi",
        "lat": 38.4229,
        "lon": 38.3585
      },
      {
        "name": "Darende",
        "lat": 38.5458,
        "lon": 37.5058
      },
      {
        "name": "Doğanşehir",
        "lat": 38.0857,
        "lon": 37.8712
      },
      {
        "name": "Doğanyol",
        "lat": 38.3075,
        "lon": 39.0343
      },
      {
        "name": "Hekimhan",
        "lat": 38.8162,
        "lon": 37.9288
      },
      {
        "name": "Kale",
        "lat": 40.3869,
        "lon": 39.6833
      },
      {
        "name": "Kuluncak",
        "lat": 38.8766,
        "lon": 37.6628
      },
      {
        "name": "Pütürge",
        "lat": 38.1992,
        "lon": 38.863
      },
      {
        "name": "Yazıhan",
        "lat": 38.5929,
        "lon": 38.1733
      },
      {
        "name": "Yeşilyurt",
        "lat": 40.3279,
        "lon": 36.3514
      }
    ]
  },
  {
    "id": 45,
    "name": "Manisa",
    "lat": 38.6191,
    "lon": 27.4289,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.6191,
        "lon": 27.4289
      },
      {
        "name": "Ahmetli",
        "lat": 41.1461,
        "lon": 29.5776
      },
      {
        "name": "Akhisar",
        "lat": 40.1183,
        "lon": 29.4662
      },
      {
        "name": "Alaşehir",
        "lat": 38.3508,
        "lon": 28.5172
      },
      {
        "name": "Demirci",
        "lat": 39.0461,
        "lon": 28.6589
      },
      {
        "name": "Gölmarmara",
        "lat": 38.7139,
        "lon": 27.9142
      },
      {
        "name": "Gördes",
        "lat": 38.9328,
        "lon": 28.2894
      },
      {
        "name": "Kırkağaç",
        "lat": 39.1064,
        "lon": 27.6693
      },
      {
        "name": "Köprübaşı",
        "lat": 36.1091,
        "lon": 32.8434
      },
      {
        "name": "Kula",
        "lat": 38.5473,
        "lon": 28.6498
      },
      {
        "name": "Salihli",
        "lat": 38.4826,
        "lon": 28.1477
      },
      {
        "name": "Sarıgöl",
        "lat": 40.9475,
        "lon": 41.4948
      },
      {
        "name": "Saruhanlı",
        "lat": 38.7345,
        "lon": 27.5681
      },
      {
        "name": "Selendi",
        "lat": 38.7444,
        "lon": 28.8678
      },
      {
        "name": "Soma",
        "lat": 39.1855,
        "lon": 27.6094
      },
      {
        "name": "Şehzadeler",
        "lat": 38.6191,
        "lon": 27.4289
      },
      {
        "name": "Turgutlu",
        "lat": 37.5122,
        "lon": 35.8011
      },
      {
        "name": "Yunusemre",
        "lat": 39.2448,
        "lon": 42.8805
      }
    ]
  },
  {
    "id": 46,
    "name": "Kahramanmaraş",
    "lat": 37.5858,
    "lon": 36.9371,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.5858,
        "lon": 36.9371
      },
      {
        "name": "Afşin",
        "lat": 38.2477,
        "lon": 36.914
      },
      {
        "name": "Andırın",
        "lat": 37.5776,
        "lon": 36.3549
      },
      {
        "name": "Çağlayancerit",
        "lat": 37.7452,
        "lon": 37.2862
      },
      {
        "name": "Dulkadiroğlu",
        "lat": 37.5858,
        "lon": 36.9371
      },
      {
        "name": "Ekinözü",
        "lat": 38.0597,
        "lon": 37.1879
      },
      {
        "name": "Elbistan",
        "lat": 38.2059,
        "lon": 37.1983
      },
      {
        "name": "Göksun",
        "lat": 38.021,
        "lon": 36.4973
      },
      {
        "name": "Nurhak",
        "lat": 37.9637,
        "lon": 37.4405
      },
      {
        "name": "Onikişubat",
        "lat": 37.5858,
        "lon": 36.9371
      },
      {
        "name": "Pazarcık",
        "lat": 37.4868,
        "lon": 37.2996
      },
      {
        "name": "Türkoğlu",
        "lat": 37.3865,
        "lon": 36.8426
      }
    ]
  },
  {
    "id": 47,
    "name": "Mardin",
    "lat": 37.3212,
    "lon": 40.7245,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.3212,
        "lon": 40.7245
      },
      {
        "name": "Artuklu",
        "lat": 37.3212,
        "lon": 40.7245
      },
      {
        "name": "Dargeçit",
        "lat": 37.5462,
        "lon": 41.7165
      },
      {
        "name": "Derik",
        "lat": 37.3634,
        "lon": 40.2647
      },
      {
        "name": "Kızıltepe",
        "lat": 37.1884,
        "lon": 40.5772
      },
      {
        "name": "Mazıdağı",
        "lat": 37.478,
        "lon": 40.4815
      },
      {
        "name": "Midyat",
        "lat": 37.4191,
        "lon": 41.3391
      },
      {
        "name": "Nusaybin",
        "lat": 37.0703,
        "lon": 41.2146
      },
      {
        "name": "Ömerli",
        "lat": 40.3125,
        "lon": 28.0483
      },
      {
        "name": "Savur",
        "lat": 37.5354,
        "lon": 40.8788
      },
      {
        "name": "Yeşilli",
        "lat": 37.3381,
        "lon": 40.8174
      }
    ]
  },
  {
    "id": 48,
    "name": "Muğla",
    "lat": 37.2153,
    "lon": 28.3636,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.2153,
        "lon": 28.3636
      },
      {
        "name": "Bodrum",
        "lat": 37.0383,
        "lon": 27.4292
      },
      {
        "name": "Dalaman",
        "lat": 36.7659,
        "lon": 28.8028
      },
      {
        "name": "Datça",
        "lat": 36.7378,
        "lon": 27.6842
      },
      {
        "name": "Fethiye",
        "lat": 36.6404,
        "lon": 29.1276
      },
      {
        "name": "Kavaklıdere",
        "lat": 39.9115,
        "lon": 32.858
      },
      {
        "name": "Köyceğiz",
        "lat": 37.2153,
        "lon": 28.3636
      },
      {
        "name": "Marmaris",
        "lat": 36.855,
        "lon": 28.2742
      },
      {
        "name": "Menteşe",
        "lat": 37.1167,
        "lon": 28.2667
      },
      {
        "name": "Milas",
        "lat": 37.3164,
        "lon": 27.7839
      },
      {
        "name": "Ortaca",
        "lat": 36.8391,
        "lon": 28.7646
      },
      {
        "name": "Seydikemer",
        "lat": 37.2153,
        "lon": 28.3636
      },
      {
        "name": "Ula",
        "lat": 37.1049,
        "lon": 28.4167
      },
      {
        "name": "Yatağan",
        "lat": 37.3402,
        "lon": 28.1428
      }
    ]
  },
  {
    "id": 49,
    "name": "Muş",
    "lat": 38.7432,
    "lon": 41.5064,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.7432,
        "lon": 41.5064
      },
      {
        "name": "Bulanık",
        "lat": 39.0866,
        "lon": 42.2716
      },
      {
        "name": "Hasköy",
        "lat": 40.9929,
        "lon": 42.8842
      },
      {
        "name": "Korkut",
        "lat": 38.7339,
        "lon": 41.784
      },
      {
        "name": "Malazgirt",
        "lat": 37.7717,
        "lon": 38.2723
      },
      {
        "name": "Varto",
        "lat": 39.1737,
        "lon": 41.454
      }
    ]
  },
  {
    "id": 50,
    "name": "Nevşehir",
    "lat": 38.625,
    "lon": 34.7122,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.625,
        "lon": 34.7122
      },
      {
        "name": "Acıgöl",
        "lat": 38.5503,
        "lon": 34.5092
      },
      {
        "name": "Avanos",
        "lat": 38.715,
        "lon": 34.8467
      },
      {
        "name": "Derinkuyu",
        "lat": 38.3751,
        "lon": 34.7342
      },
      {
        "name": "Gülşehir",
        "lat": 38.7459,
        "lon": 34.6252
      },
      {
        "name": "Hacıbektaş",
        "lat": 38.9408,
        "lon": 34.5577
      },
      {
        "name": "Kozaklı",
        "lat": 39.2214,
        "lon": 34.8506
      },
      {
        "name": "Ürgüp",
        "lat": 38.6296,
        "lon": 34.912
      }
    ]
  },
  {
    "id": 51,
    "name": "Niğde",
    "lat": 37.9667,
    "lon": 34.6833,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.9667,
        "lon": 34.6833
      },
      {
        "name": "Altunhisar",
        "lat": 37.9916,
        "lon": 34.3733
      },
      {
        "name": "Bor",
        "lat": 37.8906,
        "lon": 34.5589
      },
      {
        "name": "Çamardı",
        "lat": 37.8322,
        "lon": 34.9814
      },
      {
        "name": "Çiftlik",
        "lat": 40.0723,
        "lon": 42.2562
      },
      {
        "name": "Ulukışla",
        "lat": 37.5478,
        "lon": 34.4853
      }
    ]
  },
  {
    "id": 52,
    "name": "Ordu",
    "lat": 40.9839,
    "lon": 37.8764,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.9839,
        "lon": 37.8764
      },
      {
        "name": "Akkuş",
        "lat": 40.7931,
        "lon": 37.0164
      },
      {
        "name": "Altınordu",
        "lat": 40.984,
        "lon": 37.8735
      },
      {
        "name": "Aybastı",
        "lat": 40.6867,
        "lon": 37.3992
      },
      {
        "name": "Çamaş",
        "lat": 40.902,
        "lon": 37.5279
      },
      {
        "name": "Çatalpınar",
        "lat": 40.879,
        "lon": 37.4535
      },
      {
        "name": "Çaybaşı",
        "lat": 41.0171,
        "lon": 37.098
      },
      {
        "name": "Fatsa",
        "lat": 41.0289,
        "lon": 37.4998
      },
      {
        "name": "Gölköy",
        "lat": 40.6991,
        "lon": 31.5101
      },
      {
        "name": "Gülyalı",
        "lat": 40.9615,
        "lon": 38.0494
      },
      {
        "name": "Gürgentepe",
        "lat": 40.7899,
        "lon": 37.6007
      },
      {
        "name": "İkizce",
        "lat": 41.0583,
        "lon": 37.0803
      },
      {
        "name": "Kabadüz",
        "lat": 40.861,
        "lon": 37.8847
      },
      {
        "name": "Kabataş",
        "lat": 40.75,
        "lon": 37.45
      },
      {
        "name": "Korgan",
        "lat": 40.8247,
        "lon": 37.3467
      },
      {
        "name": "Kumru",
        "lat": 40.8744,
        "lon": 37.2639
      },
      {
        "name": "Mesudiye",
        "lat": 40.4545,
        "lon": 37.7735
      },
      {
        "name": "Perşembe",
        "lat": 41.4187,
        "lon": 32.1598
      },
      {
        "name": "Ulubey",
        "lat": 40.8686,
        "lon": 37.754
      },
      {
        "name": "Ünye",
        "lat": 41.1405,
        "lon": 37.2885
      }
    ]
  },
  {
    "id": 53,
    "name": "Rize",
    "lat": 41.0201,
    "lon": 40.5234,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.0201,
        "lon": 40.5234
      },
      {
        "name": "Ardeşen",
        "lat": 41.1906,
        "lon": 40.9793
      },
      {
        "name": "Çamlıhemşin",
        "lat": 41.0476,
        "lon": 41.0
      },
      {
        "name": "Çayeli",
        "lat": 41.0861,
        "lon": 40.7221
      },
      {
        "name": "Derepazarı",
        "lat": 41.024,
        "lon": 40.4233
      },
      {
        "name": "Fındıklı",
        "lat": 41.269,
        "lon": 41.14
      },
      {
        "name": "Güneysu",
        "lat": 40.9813,
        "lon": 40.6046
      },
      {
        "name": "Hemşin",
        "lat": 41.0478,
        "lon": 40.8984
      },
      {
        "name": "İkizdere",
        "lat": 40.7748,
        "lon": 40.5523
      },
      {
        "name": "İyidere",
        "lat": 41.0119,
        "lon": 40.3618
      },
      {
        "name": "Kalkandere",
        "lat": 40.9205,
        "lon": 40.4369
      },
      {
        "name": "Pazar",
        "lat": 40.2765,
        "lon": 36.2835
      }
    ]
  },
  {
    "id": 54,
    "name": "Sakarya",
    "lat": 40.7569,
    "lon": 30.3783,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.7569,
        "lon": 30.3783
      },
      {
        "name": "Adapazarı",
        "lat": 40.7806,
        "lon": 30.4033
      },
      {
        "name": "Akyazı",
        "lat": 40.685,
        "lon": 30.6222
      },
      {
        "name": "Arifiye",
        "lat": 40.7004,
        "lon": 30.3508
      },
      {
        "name": "Erenler",
        "lat": 40.755,
        "lon": 30.3934
      },
      {
        "name": "Ferizli",
        "lat": 40.9408,
        "lon": 30.4858
      },
      {
        "name": "Geyve",
        "lat": 40.5075,
        "lon": 30.2925
      },
      {
        "name": "Hendek",
        "lat": 40.7994,
        "lon": 30.7481
      },
      {
        "name": "Karapürçek",
        "lat": 40.6419,
        "lon": 30.5394
      },
      {
        "name": "Karasu",
        "lat": 41.1044,
        "lon": 30.6966
      },
      {
        "name": "Kaynarca",
        "lat": 41.0308,
        "lon": 30.3075
      },
      {
        "name": "Kocaali",
        "lat": 41.0534,
        "lon": 30.8528
      },
      {
        "name": "Pamukova",
        "lat": 40.5081,
        "lon": 30.1673
      },
      {
        "name": "Sapanca",
        "lat": 40.6914,
        "lon": 30.2674
      },
      {
        "name": "Serdivan",
        "lat": 40.7738,
        "lon": 30.3801
      },
      {
        "name": "Söğütlü",
        "lat": 40.9059,
        "lon": 30.4745
      },
      {
        "name": "Taraklı",
        "lat": 40.3969,
        "lon": 30.4928
      }
    ]
  },
  {
    "id": 55,
    "name": "Samsun",
    "lat": 41.2928,
    "lon": 36.3313,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.2928,
        "lon": 36.3313
      },
      {
        "name": "19 Mayıs",
        "lat": 41.2928,
        "lon": 36.3313
      },
      {
        "name": "Alaçam",
        "lat": 41.6056,
        "lon": 35.5981
      },
      {
        "name": "Asarcık",
        "lat": 41.0356,
        "lon": 36.2356
      },
      {
        "name": "Atakum",
        "lat": 41.2928,
        "lon": 36.3313
      },
      {
        "name": "Ayvacık",
        "lat": 40.9911,
        "lon": 36.6314
      },
      {
        "name": "Bafra",
        "lat": 41.5679,
        "lon": 35.9031
      },
      {
        "name": "Canik",
        "lat": 41.2928,
        "lon": 36.3313
      },
      {
        "name": "Çarşamba",
        "lat": 41.1989,
        "lon": 36.7219
      },
      {
        "name": "Havza",
        "lat": 40.9706,
        "lon": 35.6622
      },
      {
        "name": "İlkadım",
        "lat": 41.2873,
        "lon": 36.2905
      },
      {
        "name": "Kavak",
        "lat": 41.0783,
        "lon": 36.0425
      },
      {
        "name": "Ladik",
        "lat": 40.9106,
        "lon": 35.8919
      },
      {
        "name": "Salıpazarı",
        "lat": 41.084,
        "lon": 36.8304
      },
      {
        "name": "Tekkeköy",
        "lat": 41.2117,
        "lon": 36.46
      },
      {
        "name": "Terme",
        "lat": 41.2092,
        "lon": 36.9739
      },
      {
        "name": "Vezirköprü",
        "lat": 41.1436,
        "lon": 35.4547
      },
      {
        "name": "Yakakent",
        "lat": 38.5079,
        "lon": 27.0734
      }
    ]
  },
  {
    "id": 56,
    "name": "Siirt",
    "lat": 37.9333,
    "lon": 41.95,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.9333,
        "lon": 41.95
      },
      {
        "name": "Baykan",
        "lat": 38.1575,
        "lon": 41.7733
      },
      {
        "name": "Eruh",
        "lat": 37.7418,
        "lon": 42.1742
      },
      {
        "name": "Kurtalan",
        "lat": 37.9253,
        "lon": 41.6849
      },
      {
        "name": "Pervari",
        "lat": 37.9357,
        "lon": 42.5493
      },
      {
        "name": "Şirvan",
        "lat": 38.0625,
        "lon": 42.0252
      },
      {
        "name": "Tillo",
        "lat": 37.9491,
        "lon": 42.0121
      }
    ]
  },
  {
    "id": 57,
    "name": "Sinop",
    "lat": 42.0231,
    "lon": 35.1531,
    "districts": [
      {
        "name": "Merkez",
        "lat": 42.0231,
        "lon": 35.1531
      },
      {
        "name": "Ayancık",
        "lat": 41.9447,
        "lon": 34.5861
      },
      {
        "name": "Boyabat",
        "lat": 41.4689,
        "lon": 34.7667
      },
      {
        "name": "Dikmen",
        "lat": 41.65,
        "lon": 35.2667
      },
      {
        "name": "Durağan",
        "lat": 41.4158,
        "lon": 35.0544
      },
      {
        "name": "Erfelek",
        "lat": 41.8793,
        "lon": 34.9184
      },
      {
        "name": "Gerze",
        "lat": 41.8036,
        "lon": 35.2011
      },
      {
        "name": "Saraydüzü",
        "lat": 41.3287,
        "lon": 34.8469
      },
      {
        "name": "Türkeli",
        "lat": 41.9476,
        "lon": 34.3386
      }
    ]
  },
  {
    "id": 58,
    "name": "Sivas",
    "lat": 39.7477,
    "lon": 37.0179,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.7477,
        "lon": 37.0179
      },
      {
        "name": "Akıncılar",
        "lat": 40.0717,
        "lon": 38.3433
      },
      {
        "name": "Altınyayla",
        "lat": 36.9972,
        "lon": 29.5458
      },
      {
        "name": "Divriği",
        "lat": 39.371,
        "lon": 38.1137
      },
      {
        "name": "Doğanşar",
        "lat": 40.2084,
        "lon": 37.5312
      },
      {
        "name": "Gemerek",
        "lat": 39.1834,
        "lon": 36.0719
      },
      {
        "name": "Gölova",
        "lat": 40.0619,
        "lon": 38.6067
      },
      {
        "name": "Gürün",
        "lat": 38.7223,
        "lon": 37.271
      },
      {
        "name": "Hafik",
        "lat": 39.8564,
        "lon": 37.3864
      },
      {
        "name": "İmranlı",
        "lat": 39.8754,
        "lon": 38.1136
      },
      {
        "name": "Kangal",
        "lat": 39.2335,
        "lon": 37.3911
      },
      {
        "name": "Koyulhisar",
        "lat": 40.3018,
        "lon": 37.8234
      },
      {
        "name": "Suşehri",
        "lat": 40.16,
        "lon": 38.0841
      },
      {
        "name": "Şarkışla",
        "lat": 39.3519,
        "lon": 36.4098
      },
      {
        "name": "Ulaş",
        "lat": 36.9971,
        "lon": 34.7822
      },
      {
        "name": "Yıldızeli",
        "lat": 39.8664,
        "lon": 36.5989
      },
      {
        "name": "Zara",
        "lat": 39.8978,
        "lon": 37.7583
      }
    ]
  },
  {
    "id": 59,
    "name": "Tekirdağ",
    "lat": 40.9833,
    "lon": 27.5167,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.9833,
        "lon": 27.5167
      },
      {
        "name": "Çerkezköy",
        "lat": 41.2863,
        "lon": 27.9994
      },
      {
        "name": "Çorlu",
        "lat": 41.1607,
        "lon": 27.8009
      },
      {
        "name": "Ergene",
        "lat": 40.9833,
        "lon": 27.5167
      },
      {
        "name": "Hayrabolu",
        "lat": 41.2131,
        "lon": 27.1069
      },
      {
        "name": "Kapaklı",
        "lat": 41.3291,
        "lon": 27.9806
      },
      {
        "name": "Malkara",
        "lat": 40.891,
        "lon": 26.902
      },
      {
        "name": "Marmaraereğlisi",
        "lat": 40.9833,
        "lon": 27.5167
      },
      {
        "name": "Muratlı",
        "lat": 41.1722,
        "lon": 27.4992
      },
      {
        "name": "Saray",
        "lat": 41.4425,
        "lon": 27.9206
      },
      {
        "name": "Süleymanpaşa",
        "lat": 40.9833,
        "lon": 27.5167
      },
      {
        "name": "Şarköy",
        "lat": 40.614,
        "lon": 27.1156
      }
    ]
  },
  {
    "id": 60,
    "name": "Tokat",
    "lat": 40.3167,
    "lon": 36.55,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.3167,
        "lon": 36.55
      },
      {
        "name": "Almus",
        "lat": 40.3758,
        "lon": 36.9044
      },
      {
        "name": "Artova",
        "lat": 40.1158,
        "lon": 36.3001
      },
      {
        "name": "Başçiftlik",
        "lat": 40.5469,
        "lon": 37.1692
      },
      {
        "name": "Erbaa",
        "lat": 40.6689,
        "lon": 36.5675
      },
      {
        "name": "Niksar",
        "lat": 40.5917,
        "lon": 36.9517
      },
      {
        "name": "Pazar",
        "lat": 40.2765,
        "lon": 36.2835
      },
      {
        "name": "Reşadiye",
        "lat": 40.3919,
        "lon": 37.3375
      },
      {
        "name": "Sulusaray",
        "lat": 39.9939,
        "lon": 36.084
      },
      {
        "name": "Turhal",
        "lat": 40.3875,
        "lon": 36.0811
      },
      {
        "name": "Yeşilyurt",
        "lat": 40.3279,
        "lon": 36.3514
      },
      {
        "name": "Zile",
        "lat": 40.3031,
        "lon": 35.8864
      }
    ]
  },
  {
    "id": 61,
    "name": "Trabzon",
    "lat": 41.0015,
    "lon": 39.7178,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.0015,
        "lon": 39.7178
      },
      {
        "name": "Akçaabat",
        "lat": 41.0212,
        "lon": 39.5715
      },
      {
        "name": "Araklı",
        "lat": 40.9385,
        "lon": 40.0584
      },
      {
        "name": "Arsin",
        "lat": 40.9527,
        "lon": 39.9267
      },
      {
        "name": "Beşikdüzü",
        "lat": 41.052,
        "lon": 39.2329
      },
      {
        "name": "Çarşıbaşı",
        "lat": 41.0828,
        "lon": 39.3828
      },
      {
        "name": "Çaykara",
        "lat": 40.7427,
        "lon": 40.2317
      },
      {
        "name": "Dernekpazarı",
        "lat": 40.7966,
        "lon": 40.2446
      },
      {
        "name": "Düzköy",
        "lat": 40.8746,
        "lon": 39.4154
      },
      {
        "name": "Hayrat",
        "lat": 40.8853,
        "lon": 40.365
      },
      {
        "name": "Köprübaşı",
        "lat": 36.1091,
        "lon": 32.8434
      },
      {
        "name": "Maçka",
        "lat": 40.8107,
        "lon": 39.6046
      },
      {
        "name": "Of",
        "lat": 40.9406,
        "lon": 40.2592
      },
      {
        "name": "Ortahisar",
        "lat": 41.0015,
        "lon": 39.7178
      },
      {
        "name": "Sürmene",
        "lat": 40.9059,
        "lon": 40.1279
      },
      {
        "name": "Şalpazarı",
        "lat": 40.9383,
        "lon": 39.1901
      },
      {
        "name": "Tonya",
        "lat": 40.884,
        "lon": 39.2849
      },
      {
        "name": "Vakfıkebir",
        "lat": 41.0458,
        "lon": 39.2764
      },
      {
        "name": "Yomra",
        "lat": 40.9533,
        "lon": 39.8555
      }
    ]
  },
  {
    "id": 62,
    "name": "Tunceli",
    "lat": 39.1079,
    "lon": 39.5401,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.1079,
        "lon": 39.5401
      },
      {
        "name": "Çemişgezek",
        "lat": 39.0554,
        "lon": 38.9075
      },
      {
        "name": "Hozat",
        "lat": 39.1003,
        "lon": 39.2082
      },
      {
        "name": "Mazgirt",
        "lat": 39.0178,
        "lon": 39.6006
      },
      {
        "name": "Nazımiye",
        "lat": 39.1799,
        "lon": 39.8284
      },
      {
        "name": "Ovacık",
        "lat": 36.1703,
        "lon": 33.5567
      },
      {
        "name": "Pertek",
        "lat": 38.8657,
        "lon": 39.3227
      },
      {
        "name": "Pülümür",
        "lat": 39.1079,
        "lon": 39.5401
      }
    ]
  },
  {
    "id": 63,
    "name": "Şanlıurfa",
    "lat": 37.1674,
    "lon": 38.7955,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.1674,
        "lon": 38.7955
      },
      {
        "name": "Akçakale",
        "lat": 38.0897,
        "lon": 39.6997
      },
      {
        "name": "Birecik",
        "lat": 37.0258,
        "lon": 37.9784
      },
      {
        "name": "Bozova",
        "lat": 37.2161,
        "lon": 30.2858
      },
      {
        "name": "Ceylanpınar",
        "lat": 36.8472,
        "lon": 40.05
      },
      {
        "name": "Eyyübiye",
        "lat": 37.1674,
        "lon": 38.7955
      },
      {
        "name": "Halfeti",
        "lat": 37.2453,
        "lon": 37.8687
      },
      {
        "name": "Haliliye",
        "lat": 37.1674,
        "lon": 38.7955
      },
      {
        "name": "Harran",
        "lat": 36.86,
        "lon": 39.0314
      },
      {
        "name": "Hilvan",
        "lat": 37.5869,
        "lon": 38.955
      },
      {
        "name": "Karaköprü",
        "lat": 37.2036,
        "lon": 38.7994
      },
      {
        "name": "Siverek",
        "lat": 37.755,
        "lon": 39.3167
      },
      {
        "name": "Suruç",
        "lat": 36.9761,
        "lon": 38.4253
      },
      {
        "name": "Viranşehir",
        "lat": 37.2235,
        "lon": 39.7552
      }
    ]
  },
  {
    "id": 64,
    "name": "Uşak",
    "lat": 38.6823,
    "lon": 29.4082,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.6823,
        "lon": 29.4082
      },
      {
        "name": "Banaz",
        "lat": 38.7371,
        "lon": 29.7519
      },
      {
        "name": "Eşme",
        "lat": 37.1549,
        "lon": 40.6412
      },
      {
        "name": "Karahallı",
        "lat": 38.3208,
        "lon": 29.5303
      },
      {
        "name": "Sivaslı",
        "lat": 38.4994,
        "lon": 29.6836
      },
      {
        "name": "Ulubey",
        "lat": 40.8686,
        "lon": 37.754
      }
    ]
  },
  {
    "id": 65,
    "name": "Van",
    "lat": 38.4891,
    "lon": 43.4089,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.4891,
        "lon": 43.4089
      },
      {
        "name": "Bahçesaray",
        "lat": 38.1246,
        "lon": 42.7983
      },
      {
        "name": "Başkale",
        "lat": 38.0453,
        "lon": 44.0172
      },
      {
        "name": "Çaldıran",
        "lat": 39.1432,
        "lon": 43.9107
      },
      {
        "name": "Çatak",
        "lat": 38.0029,
        "lon": 43.0524
      },
      {
        "name": "Edremit",
        "lat": 39.5961,
        "lon": 27.0244
      },
      {
        "name": "Erciş",
        "lat": 39.0259,
        "lon": 43.3596
      },
      {
        "name": "Gevaş",
        "lat": 38.2921,
        "lon": 43.1019
      },
      {
        "name": "Gürpınar",
        "lat": 40.992,
        "lon": 28.603
      },
      {
        "name": "İpekyolu",
        "lat": 38.4891,
        "lon": 43.4089
      },
      {
        "name": "Muradiye",
        "lat": 38.6602,
        "lon": 27.3384
      },
      {
        "name": "Özalp",
        "lat": 38.6546,
        "lon": 43.9887
      },
      {
        "name": "Saray",
        "lat": 41.4425,
        "lon": 27.9206
      },
      {
        "name": "Tuşba",
        "lat": 38.4891,
        "lon": 43.4089
      }
    ]
  },
  {
    "id": 66,
    "name": "Yozgat",
    "lat": 39.8181,
    "lon": 34.8147,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.8181,
        "lon": 34.8147
      },
      {
        "name": "Akdağmadeni",
        "lat": 39.6603,
        "lon": 35.8836
      },
      {
        "name": "Aydıncık",
        "lat": 40.1273,
        "lon": 35.2876
      },
      {
        "name": "Boğazlıyan",
        "lat": 39.1888,
        "lon": 35.2454
      },
      {
        "name": "Çandır",
        "lat": 40.2572,
        "lon": 33.4687
      },
      {
        "name": "Çayıralan",
        "lat": 39.3028,
        "lon": 35.6439
      },
      {
        "name": "Çekerek",
        "lat": 40.0731,
        "lon": 35.4947
      },
      {
        "name": "Kadışehri",
        "lat": 39.9957,
        "lon": 35.7919
      },
      {
        "name": "Saraykent",
        "lat": 39.6936,
        "lon": 35.5111
      },
      {
        "name": "Sarıkaya",
        "lat": 39.4936,
        "lon": 35.3769
      },
      {
        "name": "Sorgun",
        "lat": 39.8101,
        "lon": 35.186
      },
      {
        "name": "Şefaatli",
        "lat": 39.5043,
        "lon": 34.7563
      },
      {
        "name": "Yenifakılı",
        "lat": 39.2114,
        "lon": 35.0004
      },
      {
        "name": "Yerköy",
        "lat": 39.6381,
        "lon": 34.4672
      }
    ]
  },
  {
    "id": 67,
    "name": "Zonguldak",
    "lat": 41.4564,
    "lon": 31.7987,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.4564,
        "lon": 31.7987
      },
      {
        "name": "Alaplı",
        "lat": 41.1814,
        "lon": 31.3851
      },
      {
        "name": "Çaycuma",
        "lat": 41.4264,
        "lon": 32.0756
      },
      {
        "name": "Devrek",
        "lat": 41.2192,
        "lon": 31.9558
      },
      {
        "name": "Ereğli",
        "lat": 41.2826,
        "lon": 31.4181
      },
      {
        "name": "Gökçebey",
        "lat": 41.3058,
        "lon": 32.1423
      },
      {
        "name": "Kilimli",
        "lat": 41.4911,
        "lon": 31.8386
      },
      {
        "name": "Kozlu",
        "lat": 40.6088,
        "lon": 36.4786
      }
    ]
  },
  {
    "id": 68,
    "name": "Aksaray",
    "lat": 38.3687,
    "lon": 34.037,
    "districts": [
      {
        "name": "Merkez",
        "lat": 38.3687,
        "lon": 34.037
      },
      {
        "name": "Ağaçören",
        "lat": 38.8748,
        "lon": 33.9167
      },
      {
        "name": "Eskil",
        "lat": 38.4017,
        "lon": 33.4131
      },
      {
        "name": "Gülağaç",
        "lat": 38.3958,
        "lon": 34.3458
      },
      {
        "name": "Güzelyurt",
        "lat": 38.2772,
        "lon": 34.3719
      },
      {
        "name": "Ortaköy",
        "lat": 37.1819,
        "lon": 28.4231
      },
      {
        "name": "Sarıyahşi",
        "lat": 38.9835,
        "lon": 33.8414
      },
      {
        "name": "Sultanhanı",
        "lat": 38.2471,
        "lon": 33.5496
      }
    ]
  },
  {
    "id": 69,
    "name": "Bayburt",
    "lat": 40.2552,
    "lon": 40.2249,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.2552,
        "lon": 40.2249
      },
      {
        "name": "Aydıntepe",
        "lat": 40.3832,
        "lon": 40.1427
      },
      {
        "name": "Demirözü",
        "lat": 40.1602,
        "lon": 39.8924
      }
    ]
  },
  {
    "id": 70,
    "name": "Karaman",
    "lat": 37.1759,
    "lon": 33.2287,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.1759,
        "lon": 33.2287
      },
      {
        "name": "Ayrancı",
        "lat": 37.3613,
        "lon": 33.6883
      },
      {
        "name": "Başyayla",
        "lat": 36.7534,
        "lon": 32.6802
      },
      {
        "name": "Ermenek",
        "lat": 36.6404,
        "lon": 32.8918
      },
      {
        "name": "Kazımkarabekir",
        "lat": 39.916,
        "lon": 41.2814
      },
      {
        "name": "Sarıveliler",
        "lat": 36.6976,
        "lon": 32.6167
      }
    ]
  },
  {
    "id": 71,
    "name": "Kırıkkale",
    "lat": 39.8468,
    "lon": 33.5153,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.8468,
        "lon": 33.5153
      },
      {
        "name": "Bahşili",
        "lat": 39.8002,
        "lon": 33.437
      },
      {
        "name": "Balışeyh",
        "lat": 39.9141,
        "lon": 33.7233
      },
      {
        "name": "Çelebi",
        "lat": 39.4642,
        "lon": 33.5241
      },
      {
        "name": "Delice",
        "lat": 39.9537,
        "lon": 34.0259
      },
      {
        "name": "Karakeçili",
        "lat": 39.5942,
        "lon": 33.3778
      },
      {
        "name": "Keskin",
        "lat": 39.6731,
        "lon": 33.6136
      },
      {
        "name": "Sulakyurt",
        "lat": 40.1573,
        "lon": 33.716
      },
      {
        "name": "Yahşihan",
        "lat": 39.8503,
        "lon": 33.4529
      }
    ]
  },
  {
    "id": 72,
    "name": "Batman",
    "lat": 37.8812,
    "lon": 41.1294,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.8812,
        "lon": 41.1294
      },
      {
        "name": "Beşiri",
        "lat": 37.9157,
        "lon": 41.2865
      },
      {
        "name": "Gercüş",
        "lat": 37.5625,
        "lon": 41.3775
      },
      {
        "name": "Hasankeyf",
        "lat": 39.5602,
        "lon": 44.0882
      },
      {
        "name": "Kozluk",
        "lat": 38.1912,
        "lon": 41.4778
      },
      {
        "name": "Sason",
        "lat": 38.3277,
        "lon": 41.4138
      }
    ]
  },
  {
    "id": 73,
    "name": "Şırnak",
    "lat": 37.5164,
    "lon": 42.4594,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.5164,
        "lon": 42.4594
      },
      {
        "name": "Beytüşşebap",
        "lat": 37.5632,
        "lon": 43.1658
      },
      {
        "name": "Cizre",
        "lat": 37.3302,
        "lon": 42.1848
      },
      {
        "name": "Güçlükonak",
        "lat": 37.4696,
        "lon": 41.9059
      },
      {
        "name": "İdil",
        "lat": 37.3348,
        "lon": 41.8894
      },
      {
        "name": "Silopi",
        "lat": 37.2438,
        "lon": 42.4635
      },
      {
        "name": "Uludere",
        "lat": 37.4407,
        "lon": 42.8524
      }
    ]
  },
  {
    "id": 74,
    "name": "Bartın",
    "lat": 41.6344,
    "lon": 32.3375,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.6344,
        "lon": 32.3375
      },
      {
        "name": "Amasra",
        "lat": 41.7463,
        "lon": 32.3863
      },
      {
        "name": "Kurucaşile",
        "lat": 41.8378,
        "lon": 32.7162
      },
      {
        "name": "Ulus",
        "lat": 41.5842,
        "lon": 32.6414
      }
    ]
  },
  {
    "id": 75,
    "name": "Ardahan",
    "lat": 41.1105,
    "lon": 42.7022,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.1105,
        "lon": 42.7022
      },
      {
        "name": "Çıldır",
        "lat": 41.1253,
        "lon": 43.1365
      },
      {
        "name": "Damal",
        "lat": 41.3415,
        "lon": 42.8368
      },
      {
        "name": "Göle",
        "lat": 40.7875,
        "lon": 42.606
      },
      {
        "name": "Hanak",
        "lat": 41.2334,
        "lon": 42.8404
      },
      {
        "name": "Posof",
        "lat": 41.5111,
        "lon": 42.7292
      }
    ]
  },
  {
    "id": 76,
    "name": "Iğdır",
    "lat": 39.9196,
    "lon": 44.045,
    "districts": [
      {
        "name": "Merkez",
        "lat": 39.9196,
        "lon": 44.045
      },
      {
        "name": "Aralık",
        "lat": 37.8295,
        "lon": 40.6803
      },
      {
        "name": "Karakoyunlu",
        "lat": 39.9706,
        "lon": 44.1768
      },
      {
        "name": "Tuzluca",
        "lat": 40.0387,
        "lon": 43.6521
      }
    ]
  },
  {
    "id": 77,
    "name": "Yalova",
    "lat": 40.65,
    "lon": 29.2667,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.65,
        "lon": 29.2667
      },
      {
        "name": "Altınova",
        "lat": 40.6949,
        "lon": 29.5099
      },
      {
        "name": "Armutlu",
        "lat": 40.5194,
        "lon": 28.8281
      },
      {
        "name": "Çınarcık",
        "lat": 40.6454,
        "lon": 29.1245
      },
      {
        "name": "Çiftlikköy",
        "lat": 40.6603,
        "lon": 29.3236
      },
      {
        "name": "Termal",
        "lat": 40.6074,
        "lon": 29.1731
      }
    ]
  },
  {
    "id": 78,
    "name": "Karabük",
    "lat": 41.2061,
    "lon": 32.6204,
    "districts": [
      {
        "name": "Merkez",
        "lat": 41.2061,
        "lon": 32.6204
      },
      {
        "name": "Eflani",
        "lat": 41.4229,
        "lon": 32.9576
      },
      {
        "name": "Eskipazar",
        "lat": 40.943,
        "lon": 32.5309
      },
      {
        "name": "Ovacık",
        "lat": 36.1703,
        "lon": 33.5567
      },
      {
        "name": "Safranbolu",
        "lat": 41.2508,
        "lon": 32.6942
      },
      {
        "name": "Yenice",
        "lat": 41.1996,
        "lon": 32.3313
      }
    ]
  },
  {
    "id": 79,
    "name": "Kilis",
    "lat": 36.7184,
    "lon": 37.1212,
    "districts": [
      {
        "name": "Merkez",
        "lat": 36.7184,
        "lon": 37.1212
      },
      {
        "name": "Elbeyli",
        "lat": 40.4861,
        "lon": 29.7247
      },
      {
        "name": "Musabeyli",
        "lat": 36.8864,
        "lon": 36.9186
      },
      {
        "name": "Polateli",
        "lat": 36.8414,
        "lon": 37.1441
      }
    ]
  },
  {
    "id": 80,
    "name": "Osmaniye",
    "lat": 37.0742,
    "lon": 36.2472,
    "districts": [
      {
        "name": "Merkez",
        "lat": 37.0742,
        "lon": 36.2472
      },
      {
        "name": "Bahçe",
        "lat": 37.1972,
        "lon": 36.5766
      },
      {
        "name": "Düziçi",
        "lat": 37.2422,
        "lon": 36.4548
      },
      {
        "name": "Hasanbeyli",
        "lat": 37.1284,
        "lon": 36.5461
      },
      {
        "name": "Kadirli",
        "lat": 37.3739,
        "lon": 36.0961
      },
      {
        "name": "Sumbas",
        "lat": 37.4513,
        "lon": 36.0235
      },
      {
        "name": "Toprakkale",
        "lat": 37.0686,
        "lon": 36.1466
      }
    ]
  },
  {
    "id": 81,
    "name": "Düzce",
    "lat": 40.8438,
    "lon": 31.1565,
    "districts": [
      {
        "name": "Merkez",
        "lat": 40.8438,
        "lon": 31.1565
      },
      {
        "name": "Akçakoca",
        "lat": 41.0894,
        "lon": 31.1236
      },
      {
        "name": "Cumayeri",
        "lat": 40.8739,
        "lon": 30.9509
      },
      {
        "name": "Çilimli",
        "lat": 40.8936,
        "lon": 31.0492
      },
      {
        "name": "Gölyaka",
        "lat": 40.7769,
        "lon": 30.9959
      },
      {
        "name": "Gümüşova",
        "lat": 40.8469,
        "lon": 30.9411
      },
      {
        "name": "Kaynaşlı",
        "lat": 40.7692,
        "lon": 31.3221
      },
      {
        "name": "Yığılca",
        "lat": 40.9598,
        "lon": 31.4435
      }
    ]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { TURKEY_CITIES };
}
