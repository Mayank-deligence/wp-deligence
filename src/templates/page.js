import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"

const PageTemplate = ({ data, location }) => {
  const page = data.wpPage

  return (
    <Layout location={location}>
      <Seo title={page.title} />
      <article style={{ maxWidth: "800px", margin: "3rem auto" }}>
        <h1>{page.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </article>
    </Layout>
  )
}

export const query = graphql`
  query($id: String!) {
    wpPage(id: { eq: $id }) {
      id
      title
      content
    }
  }
`

export default PageTemplate
