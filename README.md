# 🍉 Food Tracker 
> Next.js project to visualise a concept of an adaptive nutrition & calorie tracker app.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

- Next.js
- TailwindCSS
- [shadcn/ui](https://ui.shadcn.com/)

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## ⏩ User Journey
```mermaid
flowchart TD
  Start([Start: Dashboard])
  SetGoal[Setze Tagesziel]
  SelectRecipe[Wähle Rezept für Mahlzeit]
  ShowIngredients[Zeige Zutatenliste]
  ChangeIngredient{Zutat geändert?}
  AskAdjust[Soll Ausgleich berechnet werden?]
  RunAlgo[Algorithmus berechnet Anpassungen]
  ShowDialog[Zeige Anpassungsvorschlag]
  AcceptChange{Nutzer übernimmt Vorschlag?}
  UpdateMacros[Aktualisiere Makro-Fortschritt]
  NextMeal{Weitere Mahlzeit?}
  End([Ende: Tagesübersicht])

  Start --> SetGoal
  SetGoal --> SelectRecipe
  SelectRecipe --> ShowIngredients
  ShowIngredients --> ChangeIngredient
  ChangeIngredient -- Nein --> NextMeal
  ChangeIngredient -- Ja --> AskAdjust
  AskAdjust -- Nein --> NextMeal
  AskAdjust -- Ja --> RunAlgo
  RunAlgo --> ShowDialog
  ShowDialog --> AcceptChange
  AcceptChange -- Ja --> UpdateMacros
  AcceptChange -- Nein --> NextMeal
  UpdateMacros --> NextMeal
  NextMeal -- Ja --> SelectRecipe
  NextMeal -- Nein --> End
```

## 🏗 Implementation & Project Structure
### Project Structure
```mermaid
graph TD
  A[app]
  A1[dashboard/page.tsx]
  A2["meals/[mealType]/page.tsx"]
  A3[api/adjust-recipe/route.ts]
  B[components]
  B1[RecipeSelector.tsx]
  B2[IngredientList.tsx]
  B3[MacroOverview.tsx]
  B4[AdjustmentDialog.tsx]
  C[lib]
  C1[nutrition-algorithm.ts]
  C2[recipes.ts]
  C3[types.ts]
  D[hooks]
  D1[useRecipeAdjustment.ts]
  A --> A1
  A --> A2
  A --> A3
  B --> B1
  B --> B2
  B --> B3
  B --> B4
  C --> C1
  C --> C2
  C --> C3
  D --> D1
```