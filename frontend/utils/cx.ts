export const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter((i) => i).join(" ") || undefined;
