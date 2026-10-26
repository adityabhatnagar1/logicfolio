// D flip-flop: copies d to q on the rising edge of clk and ignores d at every other time.
module d_flip_flop (
    input  wire clk,
    input  wire d,
    output reg  q
);
    always @(posedge clk)
        q <= d;
endmodule
