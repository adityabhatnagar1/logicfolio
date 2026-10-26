A gated SR latch is an SR latch with an enable line that decides when its set and reset inputs are allowed to matter.

Picture the two-button light switch from the plain SR latch, now with a lock on the control panel. While the lock is closed, you can press whatever you like and nothing happens. Open the lock and the buttons work again. This is what lets many latches in a larger circuit change at a chosen moment instead of whenever a wire wiggles.

The forbidden case is still there: with en = 1, setting S and R together forces both outputs low.

$$ Q = \overline{(en \cdot R) + \overline{Q}}, \qquad \overline{Q} = \overline{(en \cdot S) + Q} $$

| en | S | R | Q next |
|----|---|---|--------|
| 0  | x | x | Q      |
| 1  | 0 | 0 | Q      |
| 1  | 0 | 1 | 0      |
| 1  | 1 | 0 | 1      |
| 1  | 1 | 1 | forbidden |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`.
