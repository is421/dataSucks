import org.openqa.selenium.*;
import java.util.Scanner;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
 
public class test {

     static String baseUrl="http://localhost";

     public static WebDriver mainLogin(){
	
	//User inputs Account info
	Scanner scan = new Scanner(System.in);
	System.out.println("Enter a valid username (email)");
	String name = scan.nextLine();
	System.out.println("Enter a valid password");
	String pass = scan.nextLine();

	WebDriver driver = new FirefoxDriver();


	//Open firefox on localhost
		driver.get(baseUrl);

	//Locate "username", "password" text boxes and submit button

	WebElement username = driver.findElement(By.name("username"));
	WebElement password = driver.findElement(By.name("password"));
	WebElement btn = driver.findElement(By.cssSelector("input[value=\"Signin\"]"));

	//Enter and submit user info
    username.sendKeys("datasucksalot@gmail.com");
    password.sendKeys("fucktheData");
    btn.submit();
	return driver;

    }

    public static void main(String[] args) {
        
        WebDriver driver = mainLogin();
        //Check if successful 
        if(driver.getCurrentUrl().equals(baseUrl + "/dashboard")){
        	System.out.println("Success!");
        }
        else System.out.println("Fail");
    }
}
