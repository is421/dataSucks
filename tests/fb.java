import org.openqa.selenium.*;

import java.util.Scanner;
import javax.swing.*;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.Select;
 
public class fb {
	
    public static void main(String[] args) {
    	 
        test login = new test();
        WebDriver driver = login.mainLogin();

        Scanner scan = new Scanner(System.in);
        System.out.println("Enter a valid facebook email/phone");
        String name = scan.nextLine();
        System.out.println("Enter a valid facebook password");
        String pass = scan.nextLine();
       
       //Open firefox on localhost
        String baseUrl="http://localhost:80";
        driver.get(baseUrl + "/dashboard");

        WebElement fbBtn = driver.findElement(By.cssSelector("a[href=\"/auth/facebook\"]"));
        
        fbBtn.click();
        
        
        
        WebElement username = driver.findElement(By.cssSelector("input[class=\"inputtext\"]"));
        WebElement password = driver.findElement(By.cssSelector("input[class=\"inputpassword\"]"));
        WebElement loginbtn  = driver.findElement(By.cssSelector("input[value=\"Log In\"]"));
        username.sendKeys(name);
        password.sendKeys(pass);
        loginbtn.click();
        
        if(driver.findElements(By.cssSelector("div[class=\"pam login_error_box uiBoxRed\"]")).size() != 0){
        	System.out.println(driver.findElement(By.cssSelector("div[class=\"pam login_error_box uiBoxRed\"]")).getText());
        } else {
        	WebElement okay = driver.findElement(By.cssSelector("button[name=\"__CONFIRM__\"]"));
        	okay.submit();
        	System.out.println("Success!");
        }
        driver.close();
        
    }
}
