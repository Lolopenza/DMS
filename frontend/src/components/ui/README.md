# UI-Kit Documentation

## Философия дизайна

Math Lab Platform использует минималистичную, функциональную дизайн-систему:

- **Цветовая палитра:** Slate (нейтральный) + Indigo (акцент)
- **Типографика:** Inter (sans-serif), JetBrains Mono (code)
- **Spacing:** 4px grid (Tailwind default)
- **Dark mode:** Автоматическая поддержка через `dark:` префиксы

---

## Компоненты

### Button

Универсальная кнопка с 5 вариантами стилей.

```jsx
import Button from '@/components/ui/Button';

<Button variant="primary" size="lg" onClick={handleClick}>
  Calculate
</Button>

<Button variant="outline" loading={isLoading}>
  Submit
</Button>

<Button variant="danger" icon={<TrashIcon />}>
  Delete
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean (показывает спиннер)
- `disabled`: boolean
- `icon`: React.ReactNode (иконка слева)

---

### Card

Контейнер с тенями и бордерами.

```jsx
import Card, { CardHeader, CardSection } from '@/components/ui/Card';

<Card variant="elevated" padding="lg">
  <CardHeader 
    title="Calculator" 
    subtitle="Perform calculations"
    action={<Button>Reset</Button>}
  />
  <CardSection divider>
    Content here
  </CardSection>
</Card>
```

**Props:**
- `variant`: 'default' | 'bordered' | 'elevated'
- `padding`: 'none' | 'sm' | 'md' | 'lg'

---

### Input

Текстовое поле с поддержкой ошибок и подсказок.

```jsx
import Input, { Textarea, Select } from '@/components/ui/Input';

<Input
  label="Matrix A"
  type="number"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={error}
  hint="Enter a 2x2 matrix"
  required
/>

<Textarea
  label="Description"
  rows={4}
  value={text}
  onChange={(e) => setText(e.target.value)}
/>

<Select
  label="Operation"
  value={operation}
  onChange={(e) => setOperation(e.target.value)}
  options={[
    { value: 'add', label: 'Addition' },
    { value: 'multiply', label: 'Multiplication' }
  ]}
/>
```

---

## CalculatorLayout

Двухколоночный макет для калькуляторов.

```jsx
import CalculatorLayout, { CalculatorSection, CalculatorDivider } from '@/components/CalculatorLayout';

<CalculatorLayout
  title="Matrix Operations"
  subtitle="Perform matrix algebra"
  description="Learn about matrix addition, multiplication..."
  videoUrl="https://youtube.com/..."
  theoryContent={<div>Additional formulas...</div>}
>
  <CalculatorSection title="Inputs">
    <Input label="Matrix A" ... />
    <Button>Calculate</Button>
  </CalculatorSection>
  
  <CalculatorDivider />
  
  <CalculatorSection title="Result">
    {result}
  </CalculatorSection>
</CalculatorLayout>
```

---

## Миграция старых модулей

### До (старый стиль):
```jsx
<ModulePage title="Combinatorics">
  <ModuleCard>
    <div className="form-group">
      <label>n</label>
      <input type="number" />
    </div>
    <button className="btn-primary">Calculate</button>
  </ModuleCard>
</ModulePage>
```

### После (новый UI-Kit):
```jsx
<CalculatorLayout title="Combinatorics" subtitle="..." description="...">
  <CalculatorSection title="Calculator">
    <Input label="n" type="number" value={n} onChange={...} />
    <Button variant="primary">Calculate</Button>
  </CalculatorSection>
</CalculatorLayout>
```

---

## Преимущества нового подхода

1. **Консистентность:** Все калькуляторы выглядят одинаково
2. **Dark mode:** Работает из коробки
3. **Меньше кода:** Переиспользуемые компоненты
4. **Accessibility:** ARIA labels, keyboard navigation
5. **Responsive:** Мобильная версия автоматически
6. **Масштабируемость:** Легко добавлять новые модули

---

## Roadmap

- [ ] Badge компонент (для сложности алгоритмов)
- [ ] Alert компонент (для ошибок/предупреждений)
- [ ] Modal компонент (для подробных объяснений)
- [ ] Tabs компонент (для переключения между режимами)
- [ ] Tooltip компонент (для подсказок)
