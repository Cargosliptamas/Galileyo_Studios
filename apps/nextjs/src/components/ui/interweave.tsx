import type {
  FilterInterface,
  InterweaveProps,
  MatcherInterface,
} from "interweave";
import type { UrlProps } from "interweave-autolink";
import { Interweave as BaseInterweave } from "interweave";
import {
  // EmailMatcher,
  // HashtagMatcher,
  // IpMatcher,
  UrlMatcher,
} from "interweave-autolink";

const globalFilters: FilterInterface[] = [
  // new CustomFilter()
];

const globalMatchers: MatcherInterface[] = [
  // new EmailMatcher("email"),
  // new IpMatcher("ip"),
  new UrlMatcher(
    "url",
    { validateTLD: true },
    ({ children, url }: UrlProps) => {
      if (!/^https?:\/\//.test(url)) {
        return children;
      }

      return (
        <a
          className="line-clamp-1 max-w-xs truncate text-blue-500 hover:text-blue-600"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
  ),
  // new HashtagMatcher("hashtag"),
  // new EmojiMatcher("emoji", {
  //   convertEmoticon: true,
  //   convertShortcode: true,
  //   convertUnicode: true,
  // }),
];

export default function Interweave({
  filters = [],
  matchers = [],
  ...props
}: InterweaveProps) {
  // const [emojis, source, manager] = useEmojiData({
  //   compact: false,
  //   shortcodes: ['emojibase'],
  // });

  return (
    <BaseInterweave
      filters={[...globalFilters, ...filters]}
      matchers={[...globalMatchers, ...matchers]}
      // hashtagUrl={hashtagUrl}
      // emojiData={emojis}
      // emojiSource={source}
      // emojiManager={manager}
      // emojiPath={getEmojiPath}
      newWindow
      {...props}
    />
  );
}
