import { API_GET_IDENTITIES, API_SAVE_USERS } from "../../utils/constants"
import { apiGet, apiPost } from "../callCreator"
import { getIdentity } from "./getIdentity"

/**
 * Runs listidentities to get a list of the user's VerusIDs
 */
export const loadIdentities = async (chainId) => {
  try {
    const nativeIdentities = await apiPost(`native/${API_GET_IDENTITIES}`, { chainTicker: chainId, includeCanSign: true })
    if (nativeIdentities.msg !== 'success') throw new Error(nativeIdentities.result)

    // listidentities has no fully qualified names, which tell a sub-ID apart from an ID with the
    // same name. An ID whose parent is the chain is name.chain@, so only sub-IDs need getidentity.
    const identities = nativeIdentities.result.filter(id => id.cansignfor)

    return await Promise.all(identities.map(async id => {
      const isRootIdentity = id.identity.parent === id.identity.systemid
      const fullyqualifiedname = isRootIdentity
        ? `${id.identity.name}.${chainId}@`
        : (await getIdentity(chainId, id.identity.identityaddress)).fullyqualifiedname

      return { ...id, fullyqualifiedname }
    }))
  } catch (e) {
    console.error(e.message)
    throw new Error(e.message)
  }
}