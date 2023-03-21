import { NODE_ENV } from "$env/static/private";
import { verifyToken } from "$lib/server/auth/services";
import { upsertManyNeovimPlugins } from "$lib/server/prisma/neovimplugins/service";
import { scrapeRockerBooAwesomeNeovim } from "$lib/server/seeder/plugins";
import { error, type RequestEvent, type RequestHandler } from "@sveltejs/kit";

const CODICO_GITHUB_ID = 76068197

function validateAdmin(event: RequestEvent) {
  const user = verifyToken(event.cookies)
  if (!user) {
    throw error(401, 'unauthorized')
  }
  if (NODE_ENV === 'production') {
    if (user.githubId !== CODICO_GITHUB_ID) {
      throw error(403, 'forbidden')
    }
  }
}

export const GET: RequestHandler = async function (event: RequestEvent) {
  validateAdmin(event)
  const plugins = await scrapeRockerBooAwesomeNeovim()
  const saved = await upsertManyNeovimPlugins(plugins)
  const res = new Response(
      JSON.stringify(saved, undefined, 4)
  )
  return res;
};
