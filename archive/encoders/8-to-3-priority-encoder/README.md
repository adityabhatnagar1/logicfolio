An 8-to-3 priority encoder turns the highest active one of eight input lines into a 3-bit binary number.

It is the 4-to-2 idea at twice the size. When several inputs are high, only the highest-numbered one counts, like a lift that always answers the top floor first. The valid output V stays low when no input is active, so code 000 is never confused with a real press on line 0.

$$ Y_2 = D_7 + D_6 + D_5 + D_4, \qquad Y_1 = D_7 + D_6 + \overline{D_5}\,\overline{D_4}\,(D_3 + D_2) $$

$$ Y_0 = D_7 + \overline{D_6}\,D_5 + \overline{D_6}\,\overline{D_4}\,D_3 + \overline{D_6}\,\overline{D_4}\,\overline{D_2}\,D_1, \qquad V = D_7 + D_6 + \cdots + D_0 $$

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps all 256 input patterns and compares each against a scan for the highest set bit.
