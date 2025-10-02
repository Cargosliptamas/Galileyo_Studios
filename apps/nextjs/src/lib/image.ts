import { env } from "~/env";

const getBaseUrl = () => {
  return env.NEXT_PUBLIC_API_URL.replace("/v1", "/uploads/");
};

export const getUserImageUrl = (url: string | null | undefined) => {
  if (!url) {
    return null;
  }

  return getBaseUrl() + "user/" + url;
};

export const getInfluencerImageUrl = (url: string | null | undefined) => {
  if (!url) {
    return null;
  }

  return getBaseUrl() + "influencer/" + url;
};
