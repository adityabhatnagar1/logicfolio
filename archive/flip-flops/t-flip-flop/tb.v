`timescale 1ns/1ps
module tb_t_flip_flop;
    reg  clk, rst, t;
    wire q;
    reg  exp;
    integer i, errors;

    t_flip_flop dut (
        .clk(clk),
        .rst(rst),
        .t(t),
        .q(q)
    );

    task tick;
        begin
            #5 clk = 1;
            #5 clk = 0;
        end
    endtask

    initial begin
        $dumpfile("t_flip_flop.vcd");
        $dumpvars(0, tb_t_flip_flop);
        errors = 0;
        clk = 0;
        rst = 0;
        t = 0;

        // i[1] = value stored first, i[0] = t
        for (i = 0; i < 4; i = i + 1) begin
            rst = 1;
            #1;
            rst = 0;
            if (i[1]) begin
                t = 1;
                tick;
            end
            t = i[0];
            exp = i[0] ? ~i[1] : i[1];
            tick;
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL old=%b t=%b : q=%b (expected %b)", i[1], t, q, exp);
            end
        end

        // t held high: q alternates every clock
        rst = 1;
        #1;
        rst = 0;
        t = 1;
        exp = 1'b0;
        for (i = 0; i < 8; i = i + 1) begin
            exp = ~exp;
            tick;
            if (q !== exp) begin
                errors = errors + 1;
                $display("FAIL toggle %0d : q=%b (expected %b)", i, q, exp);
            end
        end

        $display("t_flip_flop: %0d errors", errors);
        $finish;
    end
endmodule
