package net.cabrasky.table2taste.backend.controller;

import net.cabrasky.table2taste.backend.jwt.JwtResponse;
import net.cabrasky.table2taste.backend.jwt.JwtUtils;
import net.cabrasky.table2taste.backend.jwt.UserDetailsImpl;
import net.cabrasky.table2taste.backend.jwt.dto.AuthRequestDTO;
import net.cabrasky.table2taste.backend.model.User;
import net.cabrasky.table2taste.backend.modelDto.UserDTO;
import net.cabrasky.table2taste.backend.service.UserService;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JwtAuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserService userService;
    	
	@Value("${app.default.tablePassword}")
    private String defaultTablePassword;


    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@RequestBody AuthRequestDTO loginRequest) {
    	userService.getById(loginRequest.username).ifPresent((u) -> {
    		if(u.getGroups() != null && u.getGroups().stream().anyMatch(group -> group.getId().equals("table")))
    		loginRequest.password = defaultTablePassword;
    	});
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.username, loginRequest.password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String jwt = jwtUtils.generateJwtToken(authentication);
        return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getUsername()));
    }

    @PostMapping("/register")
    @PreAuthorize("hasAuthority('REGISTER_USERS')")
    public ResponseEntity<String> registerUser(@RequestBody UserDTO registerRequest) {
        if (userService.existsById(registerRequest.username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already taken!");
        }
        userService.create(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
    }

    @GetMapping("/userInfo")
    public ResponseEntity<User> getUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        Optional<User> user = userService.getById(currentPrincipalName);
        return user.isPresent() 
            ? ResponseEntity.ok(user.get())
            : new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}

