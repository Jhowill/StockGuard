export type RewardedAdResult =
  | { status: 'success'; rewardType: 'temporary_ad_free' | 'feature_unlock' }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string };

type RewardedAdType = 'temporary_ad_free' | 'feature_unlock';

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function showRewardedAd(rewardType: RewardedAdType): Promise<RewardedAdResult> {
  await delay(300);
  return { status: 'success', rewardType };
}

export async function showRewardedInterstitial(featureKey: string): Promise<RewardedAdResult> {
  await delay(300);
  return { status: 'success', rewardType: 'feature_unlock' };
}
