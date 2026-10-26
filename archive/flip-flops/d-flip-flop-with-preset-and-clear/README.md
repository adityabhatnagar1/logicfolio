A D flip-flop with preset and clear has two override pins that force the output to 1 or 0 straight away, without waiting for the clock.

Think of a scoreboard with a normal "update" button that works on the beat, plus two big buttons that instantly set the display to 1 or wipe it to 0. Hardware uses these to put every flip-flop into a known state at power-up or after a fault. If both buttons are pressed at once, this design lets clear win.

$$ Q = 0 \;\text{ if } clear, \qquad Q = 1 \;\text{ if } preset \cdot \overline{clear}, \qquad Q^{+} = D \;\text{ on the rising edge of } clk \text{ otherwise} $$

| clear | preset | clk  | Q next |
|-------|--------|------|--------|
| 1     | x      | x    | 0 (immediately) |
| 0     | 1      | x    | 1 (immediately) |
| 0     | 0      | rise | D      |
| 0     | 0      | none | Q      |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench checks both overrides, their priority, and that they beat the clock.
