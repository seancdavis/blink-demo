export const partials = {
  __undefined__: `<div>PARTIAL_NOT_FOUND</div>
`,
  feedback: `<div class="{{ classname }}">{{ message }}</div>
`,
  head: `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{ title }} | U</title>
</head>
`,
  header: `<header>
  <h1>My Site</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
`,
};

export type PartialName = keyof typeof partials;
