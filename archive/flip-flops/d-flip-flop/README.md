A D flip-flop captures its data input at the instant the clock rises and holds that value until the next rising edge.

Think of a camera. The clock is the shutter button: the picture is taken at one instant, and whatever happens in front of the lens afterwards does not change the photo. Unlike a latch, which keeps following its input while a window is open, the flip-flop looks only at a single moment.

Almost every register, counter and state machine in a digital chip is built from this one cell.

$$ Q^{+} = D \quad \text{on the rising edge of } clk $$

| clk  | D | Q next |
|------|---|--------|
| rise | 0 | 0      |
| rise | 1 | 1      |
| other | x | Q     |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench also moves D just after each edge to show that Q ignores it.
