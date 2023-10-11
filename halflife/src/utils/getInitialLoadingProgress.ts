const INIT_PROGRESS_STR_1 = "Engine downloaded!";
const INIT_PROGRESS_STR_2 = "Module menu loaded as 1";
const INIT_PROGRESS_STR_3 = "Module client loaded as 2";
const INIT_PROGRESS_STR_4 = "Module server loaded as 3";
const INIT_PROGRESS_STR_5 = "Scripts downloaded!";

const getInitialLoadingProgress = (text: string): number => {
  switch (text) {
    case INIT_PROGRESS_STR_1:
      return 20;
    case INIT_PROGRESS_STR_2:
      return 30;
    case INIT_PROGRESS_STR_3:
      return 50;
    case INIT_PROGRESS_STR_4:
      return 70;
    case INIT_PROGRESS_STR_5:
      return 100;
    default:
      return 0;
  }
};

export { getInitialLoadingProgress, INIT_PROGRESS_STR_5 as FINAL_PROGRESS_STR };
