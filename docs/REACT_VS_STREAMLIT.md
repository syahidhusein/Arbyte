# Streamlit vs. React.js: A Code Comparison

This guide helps you transition from Streamlit to React by showing how common UI elements translate between the two.

## Key Differences
- **Streamlit:** Script-based. The entire script re-runs from top to bottom on every interaction. State is handled automatically or via `st.session_state`.
- **React.js:** Component-based. Only the components that need to update are re-rendered. You explicitly manage state using "Hooks" like `useState`.

---

## 1. A Simple Button

### Streamlit
In Streamlit, a button returns `True` when clicked during that specific run.

```python
import streamlit as st

if st.button("Click Me"):
    st.write("Button was clicked!")
```

### React.js
In React, you define a function to handle the "onClick" event.

```jsx
import React, { useState } from 'react';

function App() {
  const [clicked, setClicked] = useState(false);

  return (
    <div>
      <button onClick={() => setClicked(true)}>
        Click Me
      </button>
      {clicked && <p>Button was clicked!</p>}
    </div>
  );
}
```

---

## 2. Text Input

### Streamlit
You assign the result of `text_input` to a variable.

```python
name = st.text_input("Enter your name")
if name:
    st.write(f"Hello, {name}!")
```

### React.js
You need a state variable (`name`) and a setter function (`setName`) to update it when the user types (`onChange`).

```jsx
import React, { useState } from 'react';

function NameInput() {
  const [name, setName] = useState("");

  return (
    <div>
      <label>Enter your name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {name && <p>Hello, {name}!</p>}
    </div>
  );
}
```

---

## 3. Displaying a List (like Resume History)

### Streamlit
You iterate through a list and print items.

```python
history = ["Job 1", "Job 2", "Job 3"]

for job in history:
    st.write(f"- {job}")
```

### React.js
You use the `.map()` function to convert data into a list of HTML elements.

```jsx
function JobHistory() {
  const history = ["Job 1", "Job 2", "Job 3"];

  return (
    <ul>
      {history.map((job, index) => (
        <li key={index}>{job}</li>
      ))}
    </ul>
  );
}
```

## Summary for Arbyte
For your Arbyte PoC, stick with **Streamlit** (as provided in `poc_app.py`) because it lets you focus on the Python ML logic without worrying about frontend state management.

When you move to production:
1.  **Backend:** Your Python logic (scraping, ML) stays in Python (wrapped in FastAPI).
2.  **Frontend:** You build the UI in React, which talks to the Python backend via API calls.
