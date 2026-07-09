package com.volare.filter;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RequestLoggingFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private final MeterRegistry meterRegistry;

    public RequestLoggingFilter(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        long start = System.currentTimeMillis();
        // Timer.Sample starts a nanosecond-precision clock; the registry caches the
        // per-tag Timer instances so no new objects are allocated after warmup.
        Timer.Sample sample = Timer.start(meterRegistry);

        try {
            chain.doFilter(request, response);
        } finally {
            long elapsed = System.currentTimeMillis() - start;
            log.info("method={} uri={} status={} duration_ms={}",
                    req.getMethod(), req.getRequestURI(), res.getStatus(), elapsed);
            sample.stop(Timer.builder("http.server.requests.custom")
                    .tag("method", req.getMethod())
                    .tag("status", String.valueOf(res.getStatus()))
                    .publishPercentiles(0.5, 0.95, 0.99)
                    .register(meterRegistry));
        }
    }
}
