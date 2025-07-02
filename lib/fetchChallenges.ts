import * as https from "https";

interface Challenge {
  name: string;
  description: string;
  category: string;
  difficulty: number;
}

async function fetchChallenges(
  juiceShopUrl: string,
  ignoreSslWarnings: boolean
): Promise<Challenge[]> {
  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

  const options = { agent };

  try {
    const response = await fetch(
      `${juiceShopUrl}/api/Challenges`,
      options as any
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = (await response.json()) as { data: Challenge[] };
    return json.data;
  } catch (err: any) {
    throw new Error("Failed to fetch challenges from API! Argh!" + err.message);
  }
}

export = fetchChallenges;
