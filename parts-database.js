// 部品データベース（JSONからJavaScriptオブジェクトに変換）
const partsDatabase = {
  "parts": {
    "xiao-nrf52840-plus": {
      "name": "XIAO nRF52840 Plus",
      "suppliers": [
        {
          "name": "遊舎工房",
          "url": "https://shop.yushakobo.jp/products/10946?_pos=1&_sid=884ec3eed&_ss=r"
        },
        {
          "name": "SWITCH SCIENCE",
          "url": "https://www.switch-science.com/products/10468?srsltid=AfmBOop6P3scmrxNJdXFY_g8qWHIoYW5u5mDK1f3NNkCFPz9CK5flvyk"
        },
        {
          "name": "Seeed Studio",
          "url": "https://jp.seeedstudio.com/Seeed-Studio-XIAO-nRF52840-Plus-p-6359.html"
        }
      ],
      "warning": "XIAO nRF52840は対応していません。必ず「XIAO nRF52840 Plus」をお買い求めください。",
      "warningType": "warning"
    },
    "aa-battery": {
      "name": "単三電池",
      "suppliers": [
        {
          "name": "Amazon",
          "url": "https://amzn.asia/d/7iQGAJh"
        }
      ],
      "info": "電圧計測を充電池の仕様に合わせているので、充電池がおすすめです。",
      "infoType": "info"
    },
    "aaa-battery": {
      "name": "単四電池",
      "suppliers": [
        {
          "name": "Amazon",
          "url": "https://amzn.asia/d/7LVyuvz"
        }
      ],
      "info": "電圧計測を充電池の仕様に合わせているので、充電池がおすすめです。",
      "infoType": "info"
    },
    "switches-choc-mx": {
      "name": "スイッチ",
      "description": "ChocスイッチまたはMXスイッチ、Gateron LP 3.0スイッチに対応",
      "suppliers": []
    },
    "switches-choc-v1-v2": {
      "name": "キースイッチ（Choc v1またはv2）",
      "suppliers": [
        {
          "name": "遊舎工房",
          "url": "https://shop.yushakobo.jp/collections/all-switches/Kailh-Choc-V2%E3%82%B9%E3%82%A4%E3%83%83%E3%83%81"
        },
        {
          "name": "TALP KEYBOARD",
          "url": "https://shop.talpkeyboard.com/collections/kailh-chocv2"
        }
      ]
    },
    "bearing-4x1.5x2": {
      "name": "ベアリング（外径4mm、内径1.5mm、幅2mm）",
      "suppliers": [
        {
          "name": "Amazon",
          "url": "https://amzn.asia/d/0X4I1g0"
        },
        {
          "name": "モノタロウ",
          "url": "https://www.monotaro.com/p/8892/7343/"
        }
      ]
    },
    "trackball-25mm": {
      "name": "25mmトラックボール",
      "suppliers": [
        {
          "name": "Amazon",
          "url": "https://amzn.asia/d/8gMm4S2"
        },
        {
          "name": "Booth",
          "url": "https://booth.pm/ja/items/6457643"
        }
      ]
    },
    "keycaps-choc-mx": {
      "name": "キーキャップ",
      "description": "選択したスイッチタイプ（ChocまたはMX）に対応するキーキャップをご用意ください",
      "suppliers": []
    },
    "switches-choc-v1": {
      "name": "キースイッチ（Choc v1）",
      "suppliers": [
        {
          "name": "遊舎工房",
          "url": "https://shop.yushakobo.jp/collections/all-switches/Kailh-Choc-V1%E3%82%B9%E3%82%A4%E3%83%83%E3%83%81"
        },
        {
          "name": "TALP KEYBOARD",
          "url": "https://shop.talpkeyboard.com/collections/kailh-choc-v1"
        }
      ]
    },
    "keycaps-choc": {
      "name": "キーキャップ（Choc用）",
      "suppliers": [
        {
          "name": "遊舎工房",
          "url": "https://shop.yushakobo.jp/collections/keycaps/Choc%E7%94%A8"
        }
      ]
    },
    "choc-socket": {
      "name": "Chocソケット",
      "suppliers": [
        {
          "name": "遊舎工房",
          "url": "https://shop.yushakobo.jp/products/a01ps?variant=37665172553889"
        },
        {
          "name": "TALP KEYBOARD",
          "url": "https://shop.talpkeyboard.com/products/choc-kailh-pcbsocket-10"
        }
      ]
    },
    "aa-battery-holder": {
      "name": "単三電池ホルダー",
      "suppliers": [
        {
          "name": "モノタロウ",
          "url": "https://www.monotaro.com/p/6855/7365/"
        }
      ]
    },
    "aaa-battery-holder": {
      "name": "単四電池ホルダー",
      "suppliers": [
        {
          "name": "モノタロウ",
          "url": "https://www.monotaro.com/g/01267802/"
        }
      ]
    },
    "sk6812mini-e": {
      "name": "SK6812MINI-E LED",
      "suppliers": [
        {
          "name": "遊舎工房",
          "url": "https://shop.yushakobo.jp/products/sk6812mini-e-10"
        }
      ]
    },
    "m2-screw-10mm": {
      "name": "M2ねじ（10mm）",
      "suppliers": [
        {
          "name": "ウィルコ",
          "url": "https://wilco.jp/products/F/F-N.html#page1"
        }
      ]
    },
    "m2-screw-8mm-lowhead": {
      "name": "低頭M2ねじ（8mm）",
      "suppliers": [
        {
          "name": "ウィルコ",
          "url": "https://wilco.jp/products/F/FX-E.html#page3"
        }
      ]
    },
    "rubber-feet": {
      "name": "ゴム足（直径10mm、高さ2mm）",
      "suppliers": [
        {
          "name": "Amazon",
          "url": "https://amzn.asia/d/1JShrSQ"
        }
      ]
    },
    "sensor-board": {
      "name": "センサー基板",
      "suppliers": [
        {
          "name": "Booth",
          "url": "https://gohanda.booth.pm/items/7887526"
        }
      ]
    },
    "pmw3610": {
      "name": "PMW3610センサー",
      "suppliers": [
        {
          "name": "TALP KEYBOARD",
          "url": "https://shop.talpkeyboard.com/products/pmw3610dm-sudu-lm18-lsi"
        }
      ]
    },
    "ffc-cable": {
      "name": "FFCケーブル（6ピン/0.5mmピッチ/60mm/Bタイプ）",
      "suppliers": [
        {
          "name": "Amazon",
          "url": "https://amzn.asia/d/hwv1rq5"
        }
      ]
    },
    "m14-screw-5mm": {
      "name": "M1.4ねじ（5mm）",
      "suppliers": [
        {
          "name": "ウィルコ",
          "url": "https://wilco.jp/products/F/FF-N-03.html#page1"
        }
      ]
    },
    "case-data": {
      "name": "ケースデータ",
      "description": "購入後に購入履歴からダウンロード",
      "suppliers": []
    }
  },
  "keyboards": {
    "soa44": {
      "parts": [
        {
          "id": "xiao-nrf52840-plus",
          "quantity": 2,
          "unit": "個"
        },
        {
          "id": "aa-battery",
          "quantity": 2,
          "unit": "個"
        },
        {
          "id": "switches-choc-mx",
          "quantity": 44,
          "unit": "個"
        },
        {
          "id": "bearing-4x1.5x2",
          "quantity": 3,
          "unit": "個"
        },
        {
          "id": "trackball-25mm",
          "quantity": 1,
          "unit": "個"
        },
        {
          "id": "keycaps-choc-mx",
          "quantity": 44,
          "unit": "個"
        }
      ]
    },
    "soa39": {
      "parts": [
        {
          "id": "xiao-nrf52840-plus",
          "quantity": 2,
          "unit": "個"
        },
        {
          "id": "aaa-battery",
          "quantity": 2,
          "unit": "本"
        },
        {
          "id": "bearing-4x1.5x2",
          "quantity": 3,
          "unit": "個"
        },
        {
          "id": "switches-choc-v1-v2",
          "quantity": 39,
          "unit": "個"
        }
      ]
    },
    "hitsuki46-basic": {
      "parts": [
        {
          "id": "xiao-nrf52840-plus",
          "quantity": 2,
          "unit": "個"
        },
        {
          "id": "aa-battery",
          "quantity": 2,
          "unit": "個"
        },
        {
          "id": "switches-choc-mx",
          "quantity": 46,
          "unit": "個"
        },
        {
          "id": "keycaps-choc-mx",
          "quantity": 46,
          "unit": "個"
        },
        {
          "id": "choc-socket",
          "quantity": 46,
          "unit": "個"
        },
        {
          "id": "aa-battery-holder",
          "quantity": 2,
          "unit": "個"
        },
        {
          "id": "sk6812mini-e",
          "quantity": 2,
          "unit": "個"
        },
        {
          "id": "m2-screw-10mm",
          "quantity": 8,
          "unit": "個"
        },
        {
          "id": "m2-screw-8mm-lowhead",
          "quantity": 4,
          "unit": "個"
        },
        {
          "id": "rubber-feet",
          "quantity": 8,
          "unit": "個"
        },
        {
          "id": "case-data",
          "quantity": 1,
          "unit": "式"
        }
      ]
    },
    "hitsuki46-trackball": {
      "parts": [
        {
          "id": "trackball-25mm",
          "quantity": 1,
          "unit": "個"
        },
        {
          "id": "bearing-4x1.5x2",
          "quantity": 3,
          "unit": "個"
        },
        {
          "id": "sensor-board",
          "quantity": 1,
          "unit": "枚"
        },
        {
          "id": "pmw3610",
          "quantity": 1,
          "unit": "個"
        },
        {
          "id": "ffc-cable",
          "quantity": 1,
          "unit": "個"
        },
        {
          "id": "m14-screw-5mm",
          "quantity": 3,
          "unit": "個"
        }
      ]
    }
  }
};
