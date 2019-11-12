// Returns a path to an icon image based on the input string.  Defaults to a question mark on bad input.
export default function(rating: string): string {
  rating = rating.toLowerCase();
  const path = "./images/icon_svgs/icon_" + rating + ".svg";
  return path;
}
