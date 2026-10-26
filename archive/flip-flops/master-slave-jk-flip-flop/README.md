A master-slave JK flip-flop chains two latches so that the output changes only once per clock pulse, even when the inputs ask it to toggle.

Picture an airlock with two doors. The first door (master) opens while the clock is high and lets the new state in; the second door (slave) is shut, so nothing leaves yet. When the clock falls, the first door closes and the second opens, passing the stored value out. The two doors are never open together, so the output cannot race around the feedback loop and keep toggling.

The result changes on the falling edge of the clock. Note that the master is transparent while the clock is high, so J and K should stay steady during that time.

$$ m = J \cdot \overline{Q} + \overline{K} \cdot Q \;\text{ while } clk = 1, \qquad Q = m \;\text{ while } clk = 0 $$

| J | K | Q after falling edge |
|---|---|----------------------|
| 0 | 0 | Q                    |
| 0 | 1 | 0                    |
| 1 | 0 | 1                    |
| 1 | 1 | inverse of Q         |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench also checks that Q stays put while the clock is high.
