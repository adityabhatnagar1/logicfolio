A 3-to-8 decoder reads a 3-bit number and raises exactly one of eight output lines, the one with that number.

It is the same hotel switchboard with eight rooms. Each output is one minterm of the three address bits, ANDed with the enable EN. In a computer, the top address bits go into a decoder like this one, and each output becomes the chip-enable line of one memory chip or peripheral, so only the chip being addressed listens. Use EN to switch the whole block off, or to chain two 3-to-8 decoders into a 4-to-16.

$$ Y_k = EN \cdot m_k(A_2, A_1, A_0), \qquad k = 0 \ldots 7 $$

$$ Y_5 = EN\,A_2\,\overline{A_1}\,A_0 \quad \text{(example)} $$

Simulate with `iverilog -o sim tb.v design.v && vvp sim`. The testbench sweeps all 16 combinations of enable and address bits.
