# Product Requirements Prompt (PRP)

## 1. Overview

- **Feature Name:** _A short, descriptive name for the feature._

- **Objective:** _A one-sentence summary of the goal. What are we building?_

- **Why:** _What user problem does this solve or what value does it create?_

## 2. Success Criteria

_This feature will be considered complete when the following conditions are met. These must be specific and measurable._

- [ ] The code runs without errors.

- [ ] All new unit tests pass.

- [ ] All integeration tests pass.

- [ ] The feature meets all functional requirements described below.

- [ ] The code adheres to the project standards defined in `{{LLM_AGENT}}.md`.

## 3. Context & Resources

_This section contains all the information needed to implement the feature correctly._

### 📚 External Documentation:

_List any URLs for libraries, APIs, or tutorials._

- **Resource:** [Link to API Docs]

  - **Purpose:** _Explain which parts are relevant._

### 💻 Internal Codebase Patterns:

_List any existing files or code snippets from this project that should be used as a pattern or inspiration._

- **File:** `src/components/common/Card/Card.tsx`

  - **Reason:** _Follow the existing Card component pattern for consistent styling, shadow effects, and responsive padding._

- **File:** `src/hooks/useApiData.ts`

  - **Reason:** _Use this custom hook pattern for API data fetching with error handling and loading states._

- **File:** `src/components/layout/PageHeader/PageHeader.tsx`

  - **Reason:** _Follow the established pattern for page titles, breadcrumbs, and action buttons._

- **File:** `src/utils/formatters.ts`
  - **Reason:** _Use existing number and date formatting utilities for consistent data display._

### ⚠️ Known Pitfalls:

_List any critical warnings, rate limits, or tricky logic to be aware of._

- _e.g., "The external API is case-sensitive and requires a specific header."_

## 4. Implementation Blueprint

_This is the step-by-step plan for building the feature._

### Proposed File Structure:

_Show the desired directory tree, highlighting new or modified files._

```
src/
├── components/
│   └── dashboard/
│       ├── index.ts                    (new)
│       ├── Dashboard.tsx               (new)
│       ├── Dashboard.module.css        (new)
│       ├── components/
│       │   ├── MetricsGrid/
│       │   │   ├── MetricsGrid.tsx     (new)
│       │   │   └── MetricCard.tsx      (new)
│       │   ├── AnalyticsChart/
│       │   │   ├── AnalyticsChart.tsx  (new)
│       │   │   └── ChartTooltip.tsx    (new)
│       │   └── FilterPanel/
│       │       ├── FilterPanel.tsx     (new)
│       │       └── DateRangePicker.tsx (new)
├── hooks/
│   └── useDashboardData.ts             (new)
├── types/
│   └── dashboard.types.ts              (new)
└── tests/
└── components/
└── dashboard/
├── Dashboard.test.tsx      (new)
├── MetricsGrid.test.tsx    (new)
└── AnalyticsChart.test.tsx (new)
```

### Task Breakdown:

_Break the implementation into a sequence of logical tasks._

**Task 1: Type Definitions & Data Modeling**

- _Define TypeScript interfaces for dashboard data structures._

```typescript
// dashboard.types.ts
export interface DashboardMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
  format: "number" | "currency" | "percentage";
}

export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
}

export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  category?: string;
  metricType: "revenue" | "users" | "engagement";
}
```

**Task 2: Data Fetching Layer**

- _Implement custom hooks for API integration with proper error handling and caching._

```typescript
// useDashboardData.ts
export const useDashboardData = (filters: DashboardFilters) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", filters],
    queryFn: () => fetchDashboardData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const metrics = useMemo(
    () => (data ? transformMetricsData(data.metrics) : []),
    [data]
  );

  return { metrics, chartData: data?.chartData, isLoading, error };
};
```

**Task 3: Core Components**

- Build reusable, accessible components following established patterns.\_

```tsx
// Dashboard.tsx - Main container component
export const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const { metrics, chartData, isLoading, error } = useDashboardData(filters);

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return (
    <div className="dashboard-container">
      <PageHeader
        title="Analytics Dashboard"
        description="Track your key metrics and performance indicators"
      />

      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        className="mb-6"
      />

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <MetricsGrid metrics={metrics} />
          <AnalyticsChart data={chartData} />
        </>
      )}
    </div>
  );
};
```

**Task 4: Responsive Layout and Styling**

- Implement responsive grid layouts with proper breakpoints and accessibility.\_

```css
/* Dashboard.module.css */
.dashboard-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
}

.metrics-grid {
  @apply grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8;
}

.chart-container {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6;
  min-height: 400px;
}

@media (prefers-reduced-motion: reduce) {
  .chart-container {
    animation: none;
  }
}
```

## 5. Validation Plan

_How we will verify the implementation is correct._

### Unit Tests:

_Describe the specific test cases that need to be created. This is an example of the test following the previous example._

- `Dashboard.test.tsx`: Should render all components with loading states, handle API errors gracefully, and update when filters change.

- `MetricsGrid.test.tsx`: Should display formatted metrics correctly, show trend indicators, and handle empty data states.

- `AnalyticsChart.test.tsx`: Should render chart with proper data, respond to hover interactions, and be accessible via keyboard navigation.

- `useDashboardData.test.tsx`: Should fetch data correctly, handle API failures, and implement proper caching behavior.

### Integration Tests:

_End to end scenarios to cover complete user flows._

```javascript
// cypress/e2e/dashboard.cy.js
describe("Dashboard Feature", () => {
  it("should load dashboard and interact with filters", () => {
    cy.visit("/dashboard");
    cy.get('[data-testid="dashboard-container"]').should("be.visible");
    cy.get('[data-testid="metrics-grid"]').should("contain", "4");

    // Test filter interaction
    cy.get('[data-testid="date-range-picker"]').click();
    cy.get('[data-testid="last-30-days"]').click();
    cy.get('[data-testid="analytics-chart"]').should("be.visible");
  });
});
```

**Manual Test Command:**  
_Provide a simple command to run to see the feature in action._

```bash
# Start development server
npm run dev

# Run unit tests
npm run test -- --coverage src/components/dashboard

# Run accessibility tests
npm run test:a11y

# Build and analyze bundle size
npm run build && npm run analyze
```

**Expected Behavior:**

- Navigate to `/dashboard` route
- Dashboard loads with skeleton states, then displays 4 metric cards
- Chart renders with sample data and responds to hover interactions
- Filter panel allows date range selection and updates chart accordingly
- All interactions work with keyboard navigation (Tab, Enter, Arrow keys)
- Responsive design adapts properly on mobile/tablet/desktop breakpoints

**Performance Benchmarks:**

- Initial page load: < 2 seconds on 3G connection
- Filter application: < 500ms response time
- Chart interactions: 60fps smooth animations
- Bundle size increase: < 50KB after gzip compression
