import { mountSuspended } from "@nuxt/test-utils/runtime"
import { describe, expect, it } from "vitest"
import ArticlePublisherFilter from "~/components/article/ArticlePublisherFilter.vue"

const mockPublishers = [
  { id: 1, name: "Zenn" },
  { id: 2, name: "Qiita" },
]

describe("ArticlePublisherFilter", () => {
  it("「全て」ボタンが表示される", async () => {
    const wrapper = await mountSuspended(ArticlePublisherFilter, {
      props: { publishers: mockPublishers, modelValue: null },
    })
    expect(wrapper.text()).toContain("全て")
  })

  it("publisher 名がボタンとして表示される", async () => {
    const wrapper = await mountSuspended(ArticlePublisherFilter, {
      props: { publishers: mockPublishers, modelValue: null },
    })
    expect(wrapper.text()).toContain("Zenn")
    expect(wrapper.text()).toContain("Qiita")
  })

  it("「全て」ボタンクリックで update:modelValue に null が emit される", async () => {
    const wrapper = await mountSuspended(ArticlePublisherFilter, {
      props: { publishers: mockPublishers, modelValue: "Zenn" },
    })
    await wrapper.findAll("button").at(0)!.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([null])
  })

  it("publisher ボタンクリックで update:modelValue に publisher 名が emit される", async () => {
    const wrapper = await mountSuspended(ArticlePublisherFilter, {
      props: { publishers: mockPublishers, modelValue: null },
    })
    // インデックス 1 = Zenn ボタン
    await wrapper.findAll("button").at(1)!.trigger("click")
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Zenn"])
  })

  it("publishers が空のとき「全て」ボタンのみ表示される", async () => {
    const wrapper = await mountSuspended(ArticlePublisherFilter, {
      props: { publishers: [], modelValue: null },
    })
    const buttons = wrapper.findAll("button")
    expect(buttons).toHaveLength(1)
    expect(buttons[0].text()).toContain("全て")
  })
})
