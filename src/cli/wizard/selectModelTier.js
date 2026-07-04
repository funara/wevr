import { select, text, isCancel } from "@clack/prompts"

const TIER_LABELS = {
  reasoning: "Model for reasoning task (orchestrators + deep analysis)",
  precision: "Model for precision task (quality gates + verification)",
  fast: "Model for fast/cheap task (builders + formatters)",
}

export async function selectModelTier(modelDefaults) {
  const choices = {}
  for (const [tierKey, tierInfo] of Object.entries(modelDefaults)) {
    const defaultModel = `${tierInfo.provider}/${tierInfo.model}`
    const label = TIER_LABELS[tierKey] ?? tierKey

    const recommendedOptions = (tierInfo.recommended || []).map((r) => ({
      value: r.value,
      label: r.label,
    }))

    const options = [
      ...recommendedOptions,
      { value: "__custom__", label: "custom  (enter provider/model)" },
    ]

    const answer = await select({
      message: label,
      options,
    })

    if (isCancel(answer)) {
      choices[tierKey] = defaultModel
    } else if (answer === "__custom__") {
      const customModel = await text({ message: "Enter model:" })
      choices[tierKey] = isCancel(customModel) ? defaultModel : (customModel || defaultModel)
    } else {
      choices[tierKey] = answer
    }
  }
  return choices
}
