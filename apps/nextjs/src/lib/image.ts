import { env } from "~/env";

const getBaseUrl = () => {
  return env.NEXT_PUBLIC_API_URL.replace("/v1", "/uploads/");
};

export const getUserImageUrl = (url: string | null | undefined) => {
  if (!url) {
    return null;
  }

  if (url.startsWith("http") || url.startsWith("https")) {
    return url;
  }

  return getBaseUrl() + "user/" + url;
};

export const getFollowerListImageUrl = (url: string | null | undefined) => {
  if (!url) {
    return null;
  }

  if (url.startsWith("http") || url.startsWith("https")) {
    return url;
  }

  return getBaseUrl() + "followerlist/" + url;
};

export const getInfluencerImageUrl = (url: string | null | undefined) => {
  if (!url) {
    return null;
  }

  if (url.startsWith("http") || url.startsWith("https")) {
    return url;
  }

  return getBaseUrl() + "influencer/" + url;
};
