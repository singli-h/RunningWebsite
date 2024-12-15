"use client"

import React from "react"
import Header from "@/src/components/common/Header"
import FormComponent from "@/src/pages/entry/PresetEntryComponenet"

const Page = () => {
  const sectionMessage = {
    title: "Data Entry",
    paragraph: "Description",
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <Header
          title={sectionMessage.title}
          description={sectionMessage.paragraph}
        />
        <FormComponent />
      </div>
    </>
  )
}

export default Page
