import org.openqa.selenium.*;

import java.util.Scanner;
import javax.swing.*;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.Select;
 
public class imap {
	
    public static void main(String[] args) {
        String[] tmp = {"Gmail", "Microsoft Account", "Yahoo"};
        //host dropdown
        String host = (String) JOptionPane.showInputDialog(null, "Choose a Host",
                "IMAP", JOptionPane.QUESTION_MESSAGE, null, 
                tmp, // Array of choices
                tmp[0]); // Initial choice
       //System.out.println(host); the user choice
    	 
    	 
    	 
        Scanner scan = new Scanner(System.in);
        System.out.println("Enter a valid " + host + " email");
        String name = scan.nextLine();
        System.out.println("Enter a valid " + host + " password");
        String pass = scan.nextLine();
       
       //Open firefox on localhost
        WebDriver driver = new FirefoxDriver();
        String baseUrl="http://localhost:80";
        driver.get(baseUrl + "/dashboard");
        
        Select dropHost = new Select(driver.findElement(By.name("host")));
        dropHost.selectByVisibleText(host);
        
        WebElement username = driver.findElement(By.name("username"));
        WebElement password = driver.findElement(By.name("password"));
        WebElement btn = driver.findElement(By.cssSelector("input[value=\"Signup\"]"));
        
        username.sendKeys(name);
        password.sendKeys(pass);
        btn.submit();
        
        
//        if(driver.getCurrentUrl().equals("http://localhost/dashboard")){
//        	System.out.println("Success!");
//        } else {
//        	System.out.println("Fail");
//        }
        
    }
}
