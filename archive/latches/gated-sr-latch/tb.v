`timescale 1ns/1ps
module tb_gated_sr_latch;
    reg  en, s, r;
    wire q, qn;
    integer i, errors;

    gated_sr_latch dut (
        .en(en),
        .s(s),
        .r(r),
        .q(q),
        .qn(qn)
    );

    task apply;
        input en_in;
        input s_in;
        input r_in;
        input exp_q;
        input exp_qn;
        begin
            en = en_in;
            s  = s_in;
            r  = r_in;
            #10;
            if (q !== exp_q || qn !== exp_qn) begin
                errors = errors + 1;
                $display("FAIL en=%b s=%b r=%b : q=%b qn=%b (expected q=%b qn=%b)", en, s, r, q, qn, exp_q, exp_qn);
            end
        end
    endtask

    initial begin
        $dumpfile("gated_sr_latch.vcd");
        $dumpvars(0, tb_gated_sr_latch);
        errors = 0;

        apply(1, 0, 1, 0, 1);   // reset
        apply(0, 1, 0, 0, 1);   // gate closed: set ignored
        apply(0, 1, 1, 0, 1);   // gate closed: both ignored
        apply(1, 1, 0, 1, 0);   // gate open: set
        apply(0, 0, 1, 1, 0);   // gate closed: reset ignored
        apply(1, 0, 0, 1, 0);   // gate open, nothing asserted: hold
        apply(1, 0, 1, 0, 1);   // reset
        apply(1, 0, 0, 0, 1);   // hold 0
        for (i = 0; i < 4; i = i + 1) begin
            apply(1, 1, 0, 1, 0);
            apply(0, 0, 1, 1, 0);
            apply(1, 0, 1, 0, 1);
            apply(0, 1, 0, 0, 1);
        end
        apply(1, 1, 1, 0, 0);   // forbidden with gate open
        apply(1, 0, 1, 0, 1);   // leave through reset

        $display("gated_sr_latch: %0d errors", errors);
        $finish;
    end
endmodule
