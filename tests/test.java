import org.openqa.selenium.*;
import java.util.Scanner;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
 
public class test {

    public static void main(String[] args) {
        
        //User inputs Account info
        Scanner scan = new Scanner(System.in);
        System.out.println("Enter a valid username (email)");
        String name = scan.nextLine();
        System.out.println("Enter a valid password");
        String pass = scan.nextLine();
        
    	//Open firefox on localhost
        WebDriver driver = new FirefoxDriver();
        String baseUrl="http://localhost:80";
        driver.get(baseUrl);
        
        //Locate "username", "password" text boxes and submit button

        WebElement username = driver.findElement(By.name("username"));
        WebElement password = driver.findElement(By.name("password"));
        WebElement btn = driver.findElement(By.cssSelector("input[value=\"Signin\"]"));
        
        //Enter and submit user info
        username.sendKeys(name);
        password.sendKeys(pass);
        btn.submit();
        
        //Check if successful 
    	}

 
}
