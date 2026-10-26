A 4-to-2 priority encoder turns the highest active one of four input lines into a 2-bit binary number.

Think of four doorbells wired to one display. If two people ring at once, the display shows the higher-numbered door and ignores the other. A plain encoder has no such rule, so two simultaneous inputs get their codes mixed together and the output names a door nobody rang. The priority rule removes that problem. A valid output V also tells you whether any bell rang at all, because code 00 alone cannot separate "door 0" from "nobody".

$$ Y_1 = D_3 + D_2, \qquad Y_0 = D_3 + \overline{D_2}\,D_1, \qquad V = D_3 + D_2 + D_1 + D_0 $$

| D3 | D2 | D1 | D0 | Y1 | Y0 | V |
|----|----|----|----|----|----|---|
| 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 | 0 | 0 | 1 | 0 | 0 | 1 |
| 0 | 0 | 1 | X | 0 | 1 | 1 |
| 0 | 1 | X | X | 1 | 0 | 1 |
| 1 | X | X | X | 1 | 1 | 1 |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps all 16 input patterns.
