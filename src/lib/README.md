## 📝 Adding New Content: Blogs, Reports, and Learn More Articles

This project is designed so that new content (blog posts, reports, and learn more articles) can be added easily by updating a few files. This guide will help you add new content, even if you are new to the codebase.

### 1. Adding a New Blog Post ("Insights")

**Blog posts** are written in Markdown and listed in a metadata file.

#### Steps:
1. **Create a Markdown file**
   - Go to `src/lib/blog/posts/`.
   - Add a new file named `your-post-id.md` (e.g., `ai-process-del-2.md`).
   - Write your post in Markdown. You can use images, links, and formatting. The file should start with [frontmatter] (optional, for metadata).

2. **Add metadata**
   - Open `src/lib/blog/blogPostsList.ts`.
   - Add a new object to the `blogMetadata` array with details about your post:
     ```ts
     {
       id: "your-post-id", // must match the filename (without .md)
       title: "Your Post Title",
       excerpt: "A short summary of your post.",
       date: "YYYY-MM-DD",
       readTime: "5 min",
       category: CategoryEnum.Analysis, // or Methodology, Guide
       image: "/images/blogImages/your-image.jpg", // or a relevant image path
       displayLanguages: ["en"], // or ["sv"], or ["en", "all"] use all if you want it to show regardless of user's langugage
       language: "English", // or "Svenska"
       author: {
         name: "Your Name",
         avatar: "/people/your-avatar.jpg",
       },
       relatedPosts: ["another-post-id"], // optional
     }
     ```
   - Make sure `id` matches your Markdown filename.
   - Add your post to the correct place in the array (order is not important).

3. **Preview your post**
   - Start the development server and visit `/insights/your-post-id`.
   - Your post will appear in the Insights/Articles list if its `displayLanguages` matches the current language.

### 2. Adding a New Report

**Reports** are listed in a metadata file and usually link to a PDF.

#### Steps:
1. **Upload your report PDF and image**
   - Place your PDF in `public/reports/` (e.g., `public/reports/2025-07-01_NewReport.pdf`).
   - Place a cover image in `public/images/reportImages/` (e.g., `public/images/reportImages/2025_new_report.png`).

2. **Add metadata**
   - Open `src/lib/constants/reports.ts`.
   - Add a new object to the `reports` array:
     ```ts
     {
       id: "7", // next available number
       title: "New Report Title",
       slug: "new-report-title",
       date: "2025-07-01",
       excerpt: "A short summary of the report.",
       readTime: "10 min",
       category: "Report", // or "Rapport"
       author: {
         name: "Author Name",
         avatar: "/people/author.jpg",
       },
       link: "/reports/2025-07-01_NewReport.pdf",
       image: "/images/reportImages/2025_new_report.png",
       displayLanguages: ["en"], // or ["sv"], or ["en", "all"]
       language: "English", // or "Svenska"
     }
     ```
   - Make sure `id` is unique and incremented.
   - Add your report to the array.

3. **Preview your report**
   - Visit `/reports` to see your report in the list.
   - The link will point to your PDF.

### 3. Adding a New "Learn More" Article

**Learn More** articles are managed similarly to blogs/reports, but built as their own page/view.

#### Steps:
1. **Add metadata**
   - Open `src/lib/learn-more/articleList.ts`.
   - Add a new object to the exported array:
     ```ts
     {
       id: "your-article-id",
       title: "Article Title",
       excerpt: "A short summary.",
       date: "YYYY-MM-DD",
       image: "/images/learnMore/your-image.jpg",
       displayLanguages: ["en"],
       language: "English",
       link: "/learn-more/your-article", //
     }
     ```
   - Add your article to the array.

2. **Create your learn more page and upload your image**
   - Create the page/view in the pages/ folder or another the appropriate folder.
   - Place your image in `public/images/learnMore/`.

3. **Preview your article**
   - Visit the "Learn More" section to see your article.

---

### 🛠️ Tips
- Always check that `displayLanguages` and `language` are set correctly for your content to appear in the right language version.
- Images should be placed in the correct `public/images/` subfolder.
- For blogs, the `id` must match the Markdown filename.
- For reports, the `id` should be a unique number.
- For any questions, check existing entries for examples.

---

This guide is for editors and contributors who want to add new content. For technical or code-related questions, contact the development team.
