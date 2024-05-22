package com.tutorials.spring_react.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
// allows Spring to find and automatically apply the class to the global Web Security.
@EnableMethodSecurity
public class WebSecurityConfig {

   @Value("${spring.h2.console.path}")
   private String h2ConsolePath;

   @Autowired
   UserDetailsServiceImpl userDetailsService;
   

   @Autowired
   private AuthEntryPointJwt unauthorizedHandler;

   @Bean
   public AuthTokenFilter authenticationJwtTokenFilter(){
      return new AuthTokenFilter();
   }

   // // Not implemented in the datalake
   // @Override
   // public void configure(AuthenticationManagerBuilder authenticationManagerBuilder) throws Exception {
   //    authenticationManagerBuilder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
   // }

   // // Not implemented in the datalake
   // @Bean
   // @Override
   // // Why the heck do I need to override this???
   // public AuthenticationManager authenticationManagerBean() throws Exception {
   //    return super.authenticationManagerBean();
   // }

   @Bean
   public PasswordEncoder passwordEncoder() {
      return new BCryptPasswordEncoder();
   }

   @Bean
   // TODO: Rename this function to a verb
   public DaoAuthenticationProvider authenticationProvider(){
      DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
      authProvider.setUserDetailsService(userDetailsService);

      // If we don’t specify, it will use plain text.
      authProvider.setPasswordEncoder(passwordEncoder());

      return authProvider;
   }

   @Bean
   // TODO: Rename this function to a verb
   public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception{
      return authConfig.getAuthenticationManager();
   }

   @Bean
   // TODO: Rename this function to a verb
   public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception{
      httpSecurity
         .csrf(csrf -> csrf.disable())
         // Let me get this straight: ANY exception is handled as unauthenticated?
         .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
         .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
         .authorizeHttpRequests(auth -> auth
         // // .requestMatchers("/api/data**").permitAll()
         //    // Allow the auth endpoints to be public (duh!)
         //    .requestMatchers("/api/auth/**").permitAll()

         //    // This is to test the Authorization (eventually)
         //    .requestMatchers("/api/content/**").permitAll()

         //    // This is to test the general availability of the system
         //    .requestMatchers("/hello").permitAll()

         //    // Allow H2 console endpoints
         //    .requestMatchers(h2ConsolePath + "/**").permitAll()

         //    // Swagger endpoints. Let's keep them here
         //    .requestMatchers("/v3/api-docs/**").permitAll()
         //    .requestMatchers("/swagger-ui/**").permitAll()

            // .anyRequest().authenticated()
            .anyRequest().permitAll()
         )
      ;

       // fix H2 database console: Refused to display ' in a frame because it set 'X-Frame-Options' to 'deny'
      httpSecurity.headers(headers -> 
         headers.frameOptions(frameOption -> 
            frameOption.sameOrigin()
         )
      );

      httpSecurity.authenticationProvider(authenticationProvider());
      httpSecurity.addFilterBefore(
         authenticationJwtTokenFilter(), 
         UsernamePasswordAuthenticationFilter.class
      );
      
      return httpSecurity.build();
   }

}
