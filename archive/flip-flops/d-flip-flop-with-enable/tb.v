`timescale 1ns/1ps
module tb_d_flip_flop_with_enable;
    reg  clk, en, d;
    wire q;
    reg  exp;
    integer i, errors;

    d_flip_flop_with_enable dut (
        .clk(clk),
        .en(en),
        .d(d),
        .q(q)
    );

    task tick;
        begin
            #5 clk = 1;
            #5 clk = 0;
        end
    endtask

    initial begin
        $dumpfile("d_flip_flop_with_enable.vcd");
        $dumpvars(0, tb_d_flip_flop_with_enable);
        errors = 0;
        clk = 0;

        // i[2] = value stored first, i[1] = en, i[0] = d
        for (i = 0; i < 8; i = i + 1) begin
            en = 1;
            d  = i[2];
            tick;
            en = i[1];
            d  = i[0];
            exp = i[1] ? i[0] : i[2];
            tick;
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL old=%b en=%b d=%b : q=%b (expected %b)", i[2], en, d, q, exp);
            end
        end

        $display("d_flip_flop_with_enable: %0d errors", errors);
        $finish;
    end
endmodule
