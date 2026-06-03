package com.profresumebuilder.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Catches all non-API routes and returns index.html
 * so React Router can handle client-side navigation.
 *
 * Without this, refreshing http://localhost:8080/resumes
 * would return a 404 from Spring instead of React.
 */
@Controller
public class FrontendController {

    @RequestMapping(value = { "/", "/{path:[^\\.]*}", "/{path:[^\\.]*}/**" })
    public String forward(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Don't forward API or static asset requests
        if (path.startsWith("/api/")) return null;
        return "forward:/index.html";
    }
}
