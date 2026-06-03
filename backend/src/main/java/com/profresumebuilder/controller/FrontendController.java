package com.profresumebuilder.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrontendController {

    @RequestMapping(value = { "/", "/{path:[^\\.]*}", "/{path:[^\\.]*}/**" })
    public String forward(HttpServletRequest request) {

        String path = request.getRequestURI();

        // Allow API requests
        if (path.startsWith("/api/")) {
            return null;
        }

        // Allow Vite assets
        if (path.startsWith("/assets/")) {
            return null;
        }

        // Allow favicon
        if (path.equals("/favicon.ico")) {
            return null;
        }

        return "forward:/index.html";
    }
}