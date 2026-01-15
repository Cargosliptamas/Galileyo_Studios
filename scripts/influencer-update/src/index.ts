import { eq } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { influencerPage } from "@galileyo/db/schema";

const data: {
  id: number;
  headerImage?: string;
  socialLinks?: string[];
}[] = [
  {
    id: 15,
    socialLinks: ["https://www.stevequayle.com"],
  },
  {
    id: 28,
    headerImage:
      "https://www.hagmannpi.com/wp-content/uploads/2022/12/DOUG-HAGMANN-PI-AUTHOR.jpg",
    socialLinks: ["https://www.hagmannpi.com"],
  },
  {
    id: 35,
    headerImage:
      "https://thecommonsenseshow.com/sites/default/files/logo-glow1b_0.png",
    socialLinks: ["https://thecommonsenseshow.com/"],
  },
  {
    id: 6,
    headerImage: "https://assets.libsyn.com/secure/content/29585234",
    socialLinks: [
      "https://healthrangerreport.com",
      "https://gettr.com/user/naturalnews",
    ],
  },
  // {
  //   id: 205,
  //   headerImage: "https://yt3.googleusercontent.com/XxtYQHRtXbbxbyYAmHZafxM4a0pOIhiup3FBEeZAY_El3w6KO-jRDU7E9RMSeHIHacpZ951V=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
  //   socialLinks: [
  //     "https://www.facebook.com/StrategicResponsePartners",
  //     "https://www.youtube.com/user/StrategicResponseUSA",
  //     "https://www.instagram.com/strategicresponsepartners_/",
  //   ],
  // },
  {
    id: 48,
    headerImage:
      "https://themelkshow.com/wp-content/uploads/2024/10/About-page-background-v3.jpg",
    socialLinks: [
      "https://themelkshow.com/",
      "https://open.spotify.com/episode/0PtyrPfdteyhfLY36mg81g",
      "https://rumble.com/c/TheMelKShow",
    ],
  },
  {
    id: 71,
    headerImage:
      "https://themelkshow.com/wp-content/uploads/2024/10/About-page-background-v3.jpg",
    socialLinks: [
      "https://themelkshow.com/",
      "https://open.spotify.com/episode/0PtyrPfdteyhfLY36mg81g",
      "https://rumble.com/c/TheMelKShow",
    ],
  },
  // {
  //   id: 221,
  //   headerImage: "https://strangesounds.org/wp-content/uploads/2025/09/contact-strange-sounds-report-mystery-booms-hum.png",
  //   socialLinks: ["https://strangesounds.org/"],
  // },
  {
    id: 10,
    headerImage:
      "https://jeffreyprather.com/wp-content/uploads/2024/02/prather-head.jpg",
    socialLinks: ["https://jeffreyprather.com/"],
  },
  {
    id: 47,
    socialLinks: [
      "https://paulbegleyprophecy.org/",
      "https://www.youtube.com/@paulbegley34",
    ],
  },
  {
    id: 60,
    headerImage:
      "https://pbs.twimg.com/amplify_video_thumb/1881881739334656000/img/LKgGoT35x51TSYGA.jpg",
    socialLinks: ["https://zeeemedia.com"],
  },
  // {
  //   id: 20520,
  //   headerImage: "https://michaelyon.substack.com/archive?sort=new",
  //   socialLinks: ["https://michaelyon.substack.com"],
  // },
  {
    id: 249,
    headerImage:
      "https://www.thrivetimeshow.com/wp-content/uploads/ClayPanoram.jpg",
    socialLinks: ["https://www.thrivetimeshow.com/"],
  },
  {
    id: 74,
    socialLinks: [
      "https://consumerqb.com",
      "https://www.facebook.com/ConsumerQBShow/",
      "https://www.instagram.com/brandonrimes1",
    ],
  },
  {
    id: 72,
    headerImage: "https://i.podnews.network/r/t/600/482807-c9ea5b92.jpeg",
    socialLinks: ["https://courtenayturner.com/"],
  },
  // {
  //   id: 21122,
  //   headerImage: "https://1a-1791.com/video/z8/q/v/s/g/qvsga.caa-TheInfoWarrior-rc31ns.jpeg",
  //   socialLinks: ["https://rumble.com/c/TheInfoWarrior/videos"],
  // },
  // {
  //   id: 21123,
  //   headerImage: "https://tomrenz.com/wp-content/uploads/2024/04/Tom-Renz-About-Image-Sharp.png",
  //   socialLinks: ["https://tomrenz.com/episodes/"],
  // },
];

async function main() {
  for (const influencer of data) {
    const existingInfluencer = await db.query.influencerPage.findFirst({
      where: eq(influencerPage.id, influencer.id),
    });
    if (!existingInfluencer) {
      console.log(`Influencer ${influencer.id} not found`);
      continue;
    }

    const updatedData: Partial<(typeof data)[number]> = {};

    if (influencer.headerImage) {
      updatedData.headerImage = influencer.headerImage;
    }

    if (influencer.socialLinks && influencer.socialLinks.length > 0) {
      updatedData.socialLinks = influencer.socialLinks;
    }

    if (Object.keys(updatedData).length > 0) {
      await db
        .update(influencerPage)
        .set(updatedData)
        .where(eq(influencerPage.id, influencer.id));
    }

    console.log(`Influencer ${influencer.id} updated`);
  }
}

main()
  .then(() => {
    console.log("Influencer update completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
