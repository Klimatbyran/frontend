# Klimatkollen Frontend

Welcome to the frontend of [klimatkollen.se](https://klimatkollen.se), developed using TypeScript, React, Vite, and Tailwind CSS.

Klimatkollen is an open-source, citizen-driven platform designed to visualize climate data. Currently, we are showcasing data from major Swedish companies and Swedish municipalities.

## 🚀 Project Structure

- **`src/pages/`**: Contains `.tsx` files for each page, which are routed based on their filenames.
- **`src/components/`**: Houses reusable React components utilized throughout the application.
- **`public/`**: Stores static assets such as images.

## 🗄️ Deciding on backend to run development client against

To run the local development client, you must run our API locally or connect to our production API. For information on setting up the API locally, see the [README](https://github.com/Klimatbyran/garbo) in our data pipeline repository.

If you instead want to run the local development client against production,
setup the local `.env` file for development by running the following command in
the root directory of the frontend code.

```
cp .env.example .env.development
```

## 🧞 Building and Running Locally

To run the project locally, execute the following commands from the root of the project in your terminal:

| Command           | Action                                        |
| :---------------- | :-------------------------------------------- |
| `npm install`     | Installs dependencies                         |
| `npm run dev`     | Starts local dev server at `localhost:5173` or
VITE_API_PROXY   |
| `npm run dev-gen` | Starts local dev server at `localhost:5173` and generate api
keys | 
| `npm run build`   | Builds your production site to `./dist/`      |
| `npm run preview` | Previews your build locally, before deploying |
|| `npm run build:dataguide` | Builds the data guide from markdown files in `src/locales/dataguide/` - run this when making changes to data guide content |

**Note:** When making changes to the data guide content (markdown files in `src/locales/dataguide/`), you need to run `npm run build:dataguide` to generate the updated JSON files. This step is automatically included when running `npm run build` for production builds.

**Note:** npm audit vulnerabilities will fail the build.

## 👩‍💻 Contributing

Do you have an idea for a feature? Jump into the code or head to our [Discord server](https://discord.gg/N5P64QPQ6v) to discuss your thoughts. You can also submit an [issue](https://github.com/Klimatbyran/beta/issues) explaining your suggestion.

### How to Contribute

- **Discuss** your ideas on our Discord.
- **Submit an issue** if you can't find an existing one.
- **Pick up an issue** from our [open issues](https://github.com/Klimatbyran/beta/issues) (and leave a comment to avoid duplication of work).

## 📠 Contact

Join our [Discord server](https://discord.gg/N5P64QPQ6v) or reach out via email at [hej@klimatkollen.se](mailto:hej@klimatkollen.se).

## 🫶 Supporters and Partners

This work wouldn't have been possible without the support from Google.org.

We also extend our gratitude to our current and former partners:

Postkodstiftelsen, ClimateView, Klimatklubben.se, Researcher's Desk, Exponential Roadmap, WWF, We Don't Have Time, Våra Barns Klimat, Argand, StormGeo.

## LICENSE 

This project is licensed under the terms of the [Apache 2.0](LICENSE) © Klimatbyrån Ideell Förening.
