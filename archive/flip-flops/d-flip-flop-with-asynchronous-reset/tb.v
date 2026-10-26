`timescale 1ns/1ps
module tb_d_flip_flop_with_asynchronous_reset;
    reg  clk, rst, d;
    wire q;
    integer i, errors;

    d_flip_flop_with_asynchronous_reset dut (
        .clk(clk),
        .rst(rst),
        .d(d),
        .q(q)
    );

    task tick;
        begin
            #5 clk = 1;
            #5 clk = 0;
        end
    endtask

    task check;
        input exp;
        input [127:0] what;
        begin
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL %0s : q=%b (expected %b)", what, q, exp);
            end
        end
    endtask

    initial begin
        $dumpfile("d_flip_flop_with_asynchronous_reset.vcd");
        $dumpvars(0, tb_d_flip_flop_with_asynchronous_reset);
        errors = 0;
        clk = 0;
        rst = 0;
        d   = 0;

        // i[1] = value stored first, i[0] = d used after reset is released
        for (i = 0; i < 4; i = i + 1) begin
            rst = 0;
            d   = i[1];
            tick;
            check(i[1], "load");
            rst = 1;                 // clock is low: reset must still act
            #1;
            check(1'b0, "async reset");
            d = i[0];
            tick;                    // clock edge while reset held
            check(1'b0, "held reset");
            rst = 0;
            #1;
            check(1'b0, "after release");
            tick;
            check(i[0], "load after reset");
        end

        $display("d_flip_flop_with_asynchronous_reset: %0d errors", errors);
        $finish;
    end
endmodule
