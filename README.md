# Fibonacci Game

**Fibonacci Game** is a deterministic, grid-based logic puzzle where players strategically grow numbers to unlock the Fibonacci sequence **in strict order**.

The game focuses on planning, resource management, and long-term strategy rather than randomness or reflexes.

---

## 🎯 Game Concept

* The game is played on a **4×4 grid**
* Each cell is either **blocked** or **unblocked**
* Unblocked cells start with value **1**
* The player spends score to perform operations
* The result of operations increases the score
* Discovering Fibonacci numbers in the correct order grants bonuses

The ultimate goal is to reach the **largest possible Fibonacci number** (e.g. 144, 233, 377, 610, 987, 1597).

---

## 🧩 Rules & Mechanics

### Grid

* Size: **4×4**
* Initial state:

  * **4 unblocked cells**
  * **12 blocked cells**
* Blocked cells can be unlocked by spending score

### Available Actions

| Action    | Description                                                                                               | Cost         |
| --------- | --------------------------------------------------------------------------------------------------------- | ------------ |
| Increment | Increase the cell value by 1                                                                              | configurable |
| Sum       | Sum the values of the cell and all adjacent neighbors (including diagonals, excluding blocked cells)      | configurable |
| Multiply  | Multiply the values of the cell and all adjacent neighbors (including diagonals, excluding blocked cells) | configurable |
| Unblock   | Unlock a blocked cell (value becomes 1)                                                                   | configurable |

### Operation Rules

* The clicked cell becomes the **result** of the operation
* All other participating cells reset to **1**
* Costs are paid **before** the operation
* If the player cannot afford an action, the game ends

---

## 🔢 Fibonacci Progression

* Fibonacci numbers must be discovered **in order**:

  ```
  2 → 3 → 5 → 8 → 13 → 21 → ...
  ```
* Discovering the **next required Fibonacci number**:

  * Grants a **bonus score**
  * Advances progression
* Discovering a Fibonacci number **out of order**:

  * The number remains on the board
  * No bonus is granted
  * Progression does not advance

### Milestones

Special milestones (e.g. **144, 233, 377, 610, 987, 1597**) are visually highlighted and celebrated.

---

## ❌ Game Over Condition

The game ends when:

* The player does not have enough score to perform any valid action

There is no time limit or move limit.

---

## 🧠 Design Principles

* Fully deterministic gameplay (no random events during a run)
* Strategy-first mechanics
* No pay-to-win mechanics
* Clear separation between game logic and UI
* Short sessions with deep decision-making

---

## 🛠️ Technical Overview

### Architecture

* **Pure TypeScript game engine**
* **Angular (standalone components)** for UI
* Engine is UI-agnostic and fully testable
* Mobile build via **Capacitor** (Android-first)

### Platforms

* Web (browser)
* Android (in progress)

---

## 🚧 Project Status

**Active development**

Current focus:

* Gameplay balance
* UX and visual feedback
* Android release preparation

Planned:

* Daily challenges
* Statistics and run history
* Optional monetization (rewarded ads, premium features)

---

## 📄 License

TBD

---

## 👤 Author

**Filosoft Company SRL**
Moldova
📧 [contact@filosoft.md](mailto:contact@filosoft.md)


Just say which one.
