A 2-to-4 decoder reads a 2-bit number and raises exactly one of four output lines, the one with that number.

Picture a hotel switchboard with four rooms. Dial 2 and only room 2's light comes on. Each output is the AND of the address bits in true or inverted form, so every output is one minterm of the inputs, and the decoder generates all four at once. The enable input EN acts as a master switch: when it is low, all four outputs stay low. This is how a decoder selects one memory chip or peripheral from several without the others reacting.

$$ Y_0 = EN\,\overline{A_1}\,\overline{A_0}, \quad Y_1 = EN\,\overline{A_1}\,A_0, \quad Y_2 = EN\,A_1\,\overline{A_0}, \quad Y_3 = EN\,A_1\,A_0 $$

| EN | A1 | A0 | Y3 | Y2 | Y1 | Y0 |
|----|----|----|----|----|----|----|
| 0 | X | X | 0 | 0 | 0 | 0 |
| 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| 1 | 0 | 1 | 0 | 0 | 1 | 0 |
| 1 | 1 | 0 | 0 | 1 | 0 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 | 0 |

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps all 8 combinations of enable and address bits.
