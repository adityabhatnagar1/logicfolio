// T flip-flop: toggles q on the rising clock edge when t is high; rst clears q to 0 at power-up.
module t_flip_flop (
    input  wire clk,
    input  wire rst,
    input  wire t,
    output reg  q
);
    always @(posedge clk or posedge rst)
        if (rst)
            q <= 1'b0;
        else if (t)
            q <= ~q;
endmodule
