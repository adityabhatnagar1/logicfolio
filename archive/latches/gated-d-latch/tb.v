`timescale 1ns/1ps
module tb_gated_d_latch;
    reg  en, d;
    wire q, qn;
    reg  exp;
    integer i, errors;

    gated_d_latch dut (
        .en(en),
        .d(d),
        .q(q),
        .qn(qn)
    );

    task step;
        input [1:0] v;
        begin
            en = v[1];
            d  = v[0];
            if (en) exp = d;
            #10;
            if (q !== exp || qn !== ~exp) begin
                errors = errors + 1;
                $display("FAIL en=%b d=%b : q=%b qn=%b (expected q=%b)", en, d, q, qn, exp);
            end
        end
    endtask

    initial begin
        $dumpfile("gated_d_latch.vcd");
        $dumpvars(0, tb_gated_d_latch);
        errors = 0;
        exp = 1'b0;

        step(2'b10);   // open the gate once so the latch has a known value
        // every ordered pair of {en,d} values: i[3:2] first, then i[1:0]
        for (i = 0; i < 16; i = i + 1) begin
            step(i[3:2]);
            step(i[1:0]);
        end

        $display("gated_d_latch: %0d errors", errors);
        $finish;
    end
endmodule
