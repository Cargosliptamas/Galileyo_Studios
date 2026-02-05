export interface Influencer {
  id: number;
  urls: string[];
  disabled?: boolean;
  skipUrls?: string[];
  config?: Record<string, string | number | boolean | undefined | null>;
}

const influencers: Influencer[] = [
  {
    id: 24,
    urls: [
      "https://www.stevequayle.com/index.php?order=id&dir=DESC&rs=0&limit=100&offset=0&s=143",
    ],
  },
  {
    id: 48,
    urls: ["https://www.hagmannpi.com/"],
    skipUrls: ["https://rumble.com/HagmannReport"],
  },
  {
    id: 163,
    urls: ["https://thecommonsenseshow.com/css-breaking-news"],
  },
  {
    id: 166,
    urls: ["https://healthrangerreport.com/"],
  },
  {
    id: 205,
    disabled: true,
    urls: ["https://www.facebook.com/StrategicResponsePartners"],
  },
  {
    id: 207,
    urls: ["https://rumble.com/c/TheMelKShow/videos"],
  },
  {
    id: 221,
    urls: ["https://strangesounds.org/"],
  },
  {
    id: 222,
    urls: ["https://jeffreyprather.com/past-episodes/"],
  },
  {
    id: 1372,
    urls: ["https://www.paulbegleypodcast.com/videos/"],
  },
  {
    id: 20511,
    urls: ["https://rumble.com/user/ZeeeMedia/videos"],
  },
  {
    id: 20520,
    urls: ["https://michaelyon.substack.com/archive?sort=new"],
    config: {
      useBrowser: true,
    },
  },
  {
    id: 20789,
    urls: ["https://www.thrivetimeshow.com/business-coach-podcast/"],
  },
  {
    id: 21119,
    urls: ["https://courtenayturner.com/"],
  },
  {
    id: 21122,
    urls: ["https://rumble.com/c/TheInfoWarrior/videos"],
  },
  {
    id: 21123,
    urls: ["https://tomrenz.com/episodes/"],
  },
  {
    id: 21697,
    urls: ["https://gregreese.substack.com/archive?sort=new"],
    config: {
      useBrowser: true,
    },
  },
  {
    id: 21747,
    urls: ["https://worldviewtube.com/"],
    skipUrls: ["https://videojs.com/html5-video-support/"],
  },
];

export default influencers;
